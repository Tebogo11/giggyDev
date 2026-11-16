import {test} from 'node:test';
import assert from 'node:assert/strict';

test('actual padding card shows source edits including 12px and resets only its first-load preview',async()=>{
  for(const value of ['4px','24px','12px']){
    const {IncorrectPaddingCard}=await import(`../../.test-build/card-${value}.mjs`);
    assert.equal(IncorrectPaddingCard({sourceUpdated:true}).props.style.padding,value);
    assert.equal(IncorrectPaddingCard({sourceUpdated:false}).props.style.padding,'4px');
    assert.equal(IncorrectPaddingCard({demoPadding:'24px',sourceUpdated:false}).props.style.padding,'24px');
  }
});
