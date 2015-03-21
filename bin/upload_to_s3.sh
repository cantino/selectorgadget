#!/usr/bin/env sh

cd /tmp
if [ -e tmp-sg ]; then
  cd tmp-sg && git reset --hard && git clean -df && git fetch && git checkout origin/master
else
  git clone git@github.com:cantino/selectorgadget.git tmp-sg
  cd tmp-sg
fi
s3cmd sync --no-check-md5 --cf-invalidate -M --no-mime-magic --delete-removed --rexclude=^.git\|^sites\|^test\|^bin . s3://selectorgadget.com/unstable/
s3cmd put --no-check-md5 --cf-invalidate -M --no-mime-magic doc/* s3://selectorgadget.com
git reset --hard && git clean -df && git checkout 0.4.2
s3cmd sync --no-check-md5 --cf-invalidate -M --no-mime-magic --delete-removed --rexclude=^.git\|^sites\|^test\|^bin . s3://selectorgadget.com/stable/
