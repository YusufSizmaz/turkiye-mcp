#!/usr/bin/env bash
# Gerçek kaynak yanıtlarını test/fixtures altına kaydeder. Kullanım: scripts/record-fixtures.sh [kategori]
# Kayıtlar unit testlerin girdisidir; yeniden kaydettikten sonra testlerdeki somut değerleri güncelleyin.
set -euo pipefail
cd "$(dirname "$0")/.."
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
F=test/fixtures
only="${1:-}"
want() { [[ -z "$only" || "$only" == "$1" ]]; }
get() { local out="$1"; shift; mkdir -p "$(dirname "$F/$out")"; curl -sSL --fail --http1.1 --retry 2 -m 30 -A "$UA" -o "$F/$out" "$@"; echo "kaydedildi: $out ($(wc -c <"$F/$out") bayt)"; }

if want finans; then
  get finans/tcmb-today.xml "https://www.tcmb.gov.tr/kurlar/today.xml"
  get finans/tcmb-06112026.xml "https://www.tcmb.gov.tr/kurlar/202611/06112026.xml"
  get finans/kap-light.json "https://www.kap.org.tr/tr/api/disclosure/list/light"
  get finans/kap-main.json -X POST -H "Content-Type: application/json" -H "Referer: https://www.kap.org.tr/tr/bildirim-sorgu" \
    -d '{"fromDate":"09.11.2026","toDate":"10.11.2026","memberTypes":["IGS"],"disclosureClass":""}' \
    "https://www.kap.org.tr/tr/api/disclosure/list/main"
  get finans/truncgil.json "https://finans.truncgil.com/v4/today.json"
  get finans/isyatirim-thyao.json "https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=THYAO&startdate=01-11-2026&enddate=10-11-2026"
  get finans/btcturk.json "https://api.btcturk.com/api/v2/ticker"
  get finans/paribu.json "https://www.paribu.com/ticker"
fi
if want deprem; then
  get deprem/afad.json "https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=2026-11-09T00:00:00&end=2026-11-10T23:59:59&minmag=0&orderby=timedesc&limit=200"
  get deprem/kandilli.html "http://www.koeri.boun.edu.tr/scripts/lst0.asp"
fi
if want resmi; then
  get resmi/rg-20261110.htm "https://www.resmigazete.gov.tr/eskiler/2026/11/20261110.htm"
fi
if want hava-cevre; then
  get hava-cevre/mgm-merkezler-ankara.json -H "Origin: https://www.mgm.gov.tr" "https://servis.mgm.gov.tr/web/merkezler?il=Ankara"
  get hava-cevre/mgm-ilceler-istanbul.json -H "Origin: https://www.mgm.gov.tr" "https://servis.mgm.gov.tr/web/merkezler/ililcesi?il=%C4%B0stanbul"
  get hava-cevre/mgm-sondurum.json -H "Origin: https://www.mgm.gov.tr" "https://servis.mgm.gov.tr/web/sondurumlar?merkezid=90601"
  get hava-cevre/mgm-gunluk.json -H "Origin: https://www.mgm.gov.tr" "https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=90601"
  get hava-cevre/mgm-saatlik.json -H "Origin: https://www.mgm.gov.tr" "https://servis.mgm.gov.tr/web/tahminler/saatlik?istno=17130"
fi
if want enerji; then
  get enerji/opet-35.json "https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode=35"
fi
if want sehir; then
  get sehir/ibb-trafik.json "https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont"
  get sehir/ispark.json "https://api.ibb.gov.tr/ispark/Park"
  get sehir/ckan-search-baraj.json "https://data.ibb.gov.tr/api/3/action/package_search?q=baraj&rows=5"
fi
if want cografya; then
  get cografya/provinces-ankara.json "https://api.turkiyeapi.dev/v1/provinces?name=Ankara"
  get cografya/neighborhoods-kadikoy.json "https://api.turkiyeapi.dev/v1/neighborhoods?province=%C4%B0stanbul&district=Kad%C4%B1k%C3%B6y&limit=5"
fi
if want takvim; then
  get takvim/nager-2026.json "https://date.nager.at/api/v3/PublicHolidays/2026/TR"
  get takvim/ezan-sehirler-2.json "https://ezanvakti.emushaf.net/sehirler/2"
fi
