//grounding verifier
//checks if the evidence actually exited in the raw transcript text
//if the quote is hallucianted , it get flahhed as low confidence
export interface GroundingResult{
    fieldResults: Record<string,boolean>;
    lowConfidenceFields: string[];
    allPassed: boolean;
}

//cleans up text for comparison
export function normalizeText(text:string): string{
    return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

//counts how many words from listA appear in listB
//returns a ratio from 0  to 1
function wordOverlapRatio(wordsA:string[],wordsB:string[]):number{
    if(wordsA.length===0 || wordsB.length===0) return 0;

    const setB = new Set(wordsB);
    let matches = 0;
    for (const word of wordsA){
        if(setB.has(word)){
            matches++;
        }
    }
    return matches/ Math.max(wordsA.length,wordsB.length);
}

//check if this quote appear to be supported by the transcript
export function verifyEvidenceQuote(
    quote:string,
    transcript:string,
    threshold:number= 0.8

):boolean{
    if(!quote || !quote.trim()) return false;

    const normQuote = normalizeText(quote);
    const normTranscript = normalizeText(transcript);

    //exact substring check
    if(normTranscript.includes(normQuote)) return true;

    //fuzzy matching
    //convert quote into words
    const quoteWords = normQuote.split(" ").filter(Boolean)
    const transcriptWords = normTranscript.split(" ").filter(Boolean)

    if(quoteWords.length === 0) return false;
    if(quoteWords.length > transcriptWords.length) return false;

    const windowSize = quoteWords.length ;

    //try window size of quote length sliding across transcript
    for(let flex = -1; flex <=1;flex++){
        const currentWindow = windowSize + flex;
        if(currentWindow <= 0) continue;

        for(let i=0;i<=transcriptWords.length-currentWindow;i++){
            const windowWords = transcriptWords.slice(i,i+currentWindow);
            if(wordOverlapRatio(quoteWords,windowWords)>= threshold)return true;
            
        }
    }

    //if we get here
    return false;
}

export function verifyFieldEvidence(
    feildEvidence: Record<string,string|null>,
    transcript:string,
    threshold:number = 0.8
):GroundingResult{
    const fieldResults: Record<string,boolean> = {};
    const lowConfidenceFields:string[] = [];

    for(const [feild,quote] of Object.entries(feildEvidence)){
        if(!quote){
            fieldResults[feild] = true;
            continue;
        }

        const passed = verifyEvidenceQuote(quote,transcript,threshold);
        fieldResults[feild] = passed;
        if(!passed) lowConfidenceFields.push(feild);

        
    }
    return {
        fieldResults,
        lowConfidenceFields,
        allPassed: lowConfidenceFields.length === 0,
    }
    
}
