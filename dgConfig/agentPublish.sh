#！/bin/bash 
agentName="corpus-test"
echo "begin publish for $agentName ..." 
cd ../

echo "begin dg for $agentName ...." 
cd ./chatbot-dg
sbt "run corpus-test"
cd ../
echo "dg finish for $agentName"


echo "begin fastText train for $agentName..."
cd ./chatbot-config/script
python3 fastTextTrain.py users/$agentName
cd ../../
echo "end fastText train for $agentName"