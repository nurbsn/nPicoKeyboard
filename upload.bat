date /t
wmic logicaldisk where volumename="RPI-RP2" get deviceid > wmic.txt
for /f "skip=1" %%b IN ('type wmic.txt') DO (set PI_RP2= %%b)
copy .\build\keyboard.uf2 %PI_RP2%\
Del wmic.txt