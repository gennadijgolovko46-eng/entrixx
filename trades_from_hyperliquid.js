const HL = "https://api.hyperliquid.xyz/info";

async function post(body){
  const r = await fetch(HL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(body)
  });
  return r.json();
}

// L1 wallet -> L2 trading account
async function getAccount(wallet){
  const r = await post({
    type:"userState",
    user:wallet
  });
  return r.account;
}

// L2 account -> fills
async function getFills(account){
  return post({
    type:"userFills",
    user:account
  });
}

function groupFills(fills){
  const trades=[];
  const open={};

  fills.sort((a,b)=>a.time-b.time);

  for(const f of fills){
    const s=f.coin;
    const side=f.side;
    const t=f.time;
    const px=Number(f.px);

    if(!open[s]){
      open[s]={side,t,px};
    }else{
      const o=open[s];
      if(o.side!==side){
        trades.push({
          entry_time:o.t,
          exit_time:t,
          entry_price:o.px,
          exit_price:px,
          dir:o.side==="B"?1:-1
        });
        open[s]=null;
      }
    }
  }
  return trades;
}

export async function loadTradesFromHyperliquid(wallet){
  const account = await getAccount(wallet);
  if(!account) return [];
  const fills = await getFills(account);
  return groupFills(fills);
}
