find . -type f -not -path "*/node_modules/*" -not -path "*/.*" -not -name ".*" -exec grep -nH 'TODO:' {} \;
