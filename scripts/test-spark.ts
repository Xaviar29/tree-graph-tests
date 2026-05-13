async function testSpark() {
  const url = 'https://query1.finance.yahoo.com/v8/finance/spark?symbols=AAPL,MSFT,GOOG&range=1y&interval=1d';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await res.json();
  console.log(Object.keys(data));
  if (data.spark && data.spark.result) {
    console.log(data.spark.result.map((r: any) => ({
      symbol: r.symbol,
      dataPoints: r.response[0].timestamp?.length || 0
    })));
  } else {
    console.log(data);
  }
}
testSpark().catch(console.error);
