#!/bin/zsh
set -euo pipefail

download_drive_file() {
  local file_id="$1"
  local target="$2"

  mkdir -p "${target:h}"
  curl -L --fail --retry 3 \
    "https://drive.usercontent.google.com/download?id=${file_id}&export=download&confirm=t" \
    -o "$target"
}

# Only projects represented by HTML files in ~/Downloads/ЖК.
download_drive_file "1b3aOz1hFxk06nqBeJ4wQvMcj7OVrtuy0" "assets/images/projects/dom-daryino/drive/01.jpg"
download_drive_file "1HPOOaeBv4LB7yr40Sk89zbA9EkU3for8" "assets/images/projects/dom-daryino/drive/02.jpg"
download_drive_file "1DByhfPf4_tt1BCTvRioU131f3FWNaiLH" "assets/images/projects/dom-daryino/drive/03.jpg"
download_drive_file "1tbGxxpr6rYblgJkNMV_RajOhhJ56f1OI" "assets/images/projects/dom-daryino/drive/04.jpg"
download_drive_file "11i-9EaqxbfrdQ62U_dXsHKUurdCzZWp6" "assets/images/projects/dom-daryino/drive/05.jpg"
download_drive_file "1BBSBOzczLTtAbkc8OqRAOg4mZEfxw5Ff" "assets/images/projects/dom-daryino/drive/06.jpg"
download_drive_file "1qlE7zORdyEy6_6DmJbPo-RKenvBCNBbk" "assets/images/projects/dom-daryino/drive/07.jpg"

download_drive_file "1Tm3Jadqq3TDpeNRM3xBH8-kLb66H-oaB" "assets/images/projects/city-park/drive/01.jpg"
download_drive_file "1vkirIsmwpnTkqVy9Riygsxhn4htQV2I3" "assets/images/projects/city-park/drive/02.jpg"
download_drive_file "1Iv5AoaWFMSxA9qjt6VgYeKTukHeDNS32" "assets/images/projects/city-park/drive/03.jpg"
download_drive_file "1FhZ7YiWAzaDWkrNXw1UpVh8GJrqESerQ" "assets/images/projects/city-park/drive/04.jpg"
download_drive_file "1ldWR7lHaviQ_ovcSlSlj-3zrB4XqLtcR" "assets/images/projects/city-park/drive/05.jpg"
download_drive_file "1R_3Jv2DkctcY3AkO9zT3IuKU5uROICyh" "assets/images/projects/city-park/drive/06.jpg"
download_drive_file "13hbu07gaRLxEvThlWofe2TSV_u95wnP0" "assets/images/projects/city-park/drive/07.jpg"
download_drive_file "1XxchRLG_8T_9ukPwYvcfOq6jSZVg5TgJ" "assets/images/projects/city-park/drive/08.jpg"
download_drive_file "1mh66VyYuGmtUBJV3y0rz5Hf5OKUSlR68" "assets/images/projects/city-park/drive/09.jpg"
download_drive_file "1cou6hh7NF3brtwYIBu-_KfJ1zaiLpwmw" "assets/images/projects/city-park/drive/10.jpg"

download_drive_file "1X9Nk-mNU7gOuu4jK197XCbX_9CVEpbVb" "assets/images/projects/mushu/drive/01.jpg"
download_drive_file "1KoxvnPWpQ8eckGBc7IJTF9WIiIg0xdfh" "assets/images/projects/mushu/drive/02.jpg"
download_drive_file "1AO-T8g3O9PQwdmQNrCRp1ZQPNAhWoxFZ" "assets/images/projects/mushu/drive/03.jpg"
download_drive_file "109uCmw7nEY8jDid1O-SC6_sner9PCUwy" "assets/images/projects/mushu/drive/04.jpg"
download_drive_file "1v-IlSODdqRZiHUIHxUGLHNnwICudN55D" "assets/images/projects/mushu/drive/05.jpg"
download_drive_file "1gcbkorRPBYRRcCKoToQKTCiPuxLhzJes" "assets/images/projects/mushu/drive/06.jpg"
download_drive_file "1ASi-IWFu8HTtUt6_BQC94OSXvy8qkUH_" "assets/images/projects/mushu/drive/07.jpg"
download_drive_file "1ezqc6mkz38oHXglpF2zoeE_16D0azUak" "assets/images/projects/mushu/drive/08.jpg"
download_drive_file "19W0mtUW10R23dK6gs7QfrCqkJ-K5LSdc" "assets/images/projects/mushu/drive/09.jpg"
download_drive_file "1ppCadS_ehjjZhc7a7fe_xAtYDTMRtzbW" "assets/images/projects/mushu/drive/10.jpg"
download_drive_file "127RZl8dmcMjM8B61aCx-tbywdcpwwmx6" "assets/images/projects/mushu/drive/11.jpg"
download_drive_file "1sv2onl6iZs6VEVkT1CUnLG-k-ubm9uek" "assets/images/projects/mushu/drive/12.jpg"
download_drive_file "1dSd9_MPCZ7aA8ekgmdyQyK0Mec9pZ2jM" "assets/images/projects/mushu/drive/13.jpg"
download_drive_file "12X8jQ_dfljvisD8d9IMxBsiB_HGdMk0u" "assets/images/projects/mushu/drive/14.jpg"
download_drive_file "1XMO9GKY_V9Qk7ravYIuLRqxRF2CrvOb8" "assets/images/projects/mushu/drive/15.jpg"
download_drive_file "15Y3d223-1znAp0b65vzFx5C2mppRVHrw" "assets/images/projects/mushu/drive/16.jpg"
download_drive_file "1CRAXcLZ3axDyMsTrY5tKqI9w0ROG2Xsj" "assets/images/projects/mushu/drive/17.jpg"
download_drive_file "13cqfbWY8GgISAQG1VD2Eg9MEW1qR6pbE" "assets/images/projects/mushu/drive/18.jpg"

download_drive_file "1U3E2W3Jk6WIwxXzUNcmKSkR4M6F9o9ak" "assets/images/projects/vesna/drive/source.pdf"
