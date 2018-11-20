git reset --hard origin/master
git clean -f
git pull
pm2 --update-env restart 'uv-fit project'
