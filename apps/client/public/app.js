const scale=1000000000n;
const amount=document.querySelector("#amount");
const operation=document.querySelector("#operation");
const result=document.querySelector("#result");

function baseUnits(value){
  const [whole,frac=""]=value.trim().split(".");
  if(!/^\d+$/.test(whole)||!/^\d{0,9}$/.test(frac))throw new Error("Invalid PWRC amount");
  return BigInt(whole)*scale+BigInt(frac.padEnd(9,"0")||"0");
}
function display(value){return (BigInt(value)/scale).toString()+" PWRC";}

document.querySelector("#quote").addEventListener("click",async()=>{
  try{
    const units=baseUnits(amount.value);
    const response=await fetch(`/api/v1/fees/quote?amountBaseUnits=${units}&operation=${encodeURIComponent(operation.value)}`);
    const q=await response.json();
    if(!response.ok)throw new Error(q.error??"Quote failed");
    result.innerHTML=[
      ["Principal",display(q.principalGrossBaseUnits)],
      ["Native Token-2022 fee",display(q.nativeTransferFeeBaseUnits)],
      ["Principal net",display(q.principalNetBaseUnits)],
      ["PowerChain service fee",display(q.serviceFeeNetBaseUnits)],
      ["Native fee on service transfer",display(q.serviceFeeTransferNativeFeeBaseUnits)],
      ["Total PWRC debit",display(q.totalWalletPwrcDebitBaseUnits)],
    ].map(([label,value])=>`<div class="fee"><span>${label}</span><strong>${value}</strong></div>`).join("");
  }catch(error){result.textContent=error.message;}
});
