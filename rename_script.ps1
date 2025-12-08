Get-ChildItem -Path src -Recurse -Filter *.jsx | Rename-Item -NewName { $_.Name -replace '\.jsx$','.tsx' }
Get-ChildItem -Path src -Recurse -Filter *.js | Rename-Item -NewName { $_.Name -replace '\.js$','.ts' }
Rename-Item "vite.config.js" "vite.config.ts" -ErrorAction SilentlyContinue
