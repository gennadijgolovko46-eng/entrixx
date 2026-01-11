export async function fetchUserFills(wallet) {
  const res = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "userFills",
      user: wallet
    })
  });

  if (!res.ok) {
    throw new Error("Hyperliquid API error");
  }

  return await res.json();
}
