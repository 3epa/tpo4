#!/bin/bash
rm -rf ./report
~/apache-jmeter-5.6.3/bin/jmeter.sh -g result/results.csv -o ./report -Jjmeter.reportgenerator.overall_granularity=1000