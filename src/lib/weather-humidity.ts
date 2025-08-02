export default function getWeatherHumidity(lat: string, lon: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=relative_humidity_2m&forecast_days=1`;
      const hourlyRes = await fetch(hourlyUrl);
      const hourlyData = await hourlyRes.json();

      if (hourlyData.hourly?.relative_humidity_2m && hourlyData.hourly.time) {
        const now = new Date();
        const times = hourlyData.hourly.time.map((t: string) => new Date(t));
        let idx = times.findIndex((t: Date) => Math.abs(t.getTime() - now.getTime()) < 60 * 60 * 1000);
        if (idx === -1) idx = 0;
        resolve(Math.round(hourlyData.hourly.relative_humidity_2m[idx]));
      }
    } catch {
      reject(new Error("Erro ao obter umidade. Usando valor padrão."));
    }
  });
}
