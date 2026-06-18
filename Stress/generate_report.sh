#!/bin/bash
rm -rf ./report2
~/apache-jmeter-5.6.3/bin/jmeter.sh -g result/results2.csv -o ./report2 -Jjmeter.reportgenerator.overall_granularity=10000