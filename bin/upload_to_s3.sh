#!/usr/bin/env sh

cd /tmp
if [ -e tmp-sg ]; then
  cd tmp-sg && git reset --hard && git clean -df && git fetch && git checkout origin/master
else
  git clone git@github.com:cantino/selectorgadget.git tmp-sg
  cd tmp-sg
fi
s3cmd sync --delete-removed --rexclude=^.git\|^sites\|^test . s3://selectorgadget.com/unstable/
s3cmd put doc/* s3://selectorgadget.com
git reset --hard && git clean -df && git checkout 0.4.1
s3cmd sync --delete-removed --rexclude=^.git\|^sites\|^test . s3://selectorgadget.com/stable/
