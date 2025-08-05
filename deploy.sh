#!/bin/bash


```bash
# 1
scp 0825.zip root@60.205.169.140:/var/www/model_html_histroy/

# 2
cd /var/www/model_html_histroy/
unzip 0825.zip
# 同步目录内容，自动覆盖
rsync -av --delete 0825/ ../model_html/
```
