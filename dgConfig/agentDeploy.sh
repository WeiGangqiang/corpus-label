#！/bin/bash 
tempCfgPath="%1"
agentName="%2"
echo "begin publish for $agentName ..."
cd ../

echo "begin move config file for $agentName ...." 
rm -rf ./chatbot-config/configs/users/$agentName
rm -rf ./chatbot-config/configs/users/$agentName.yaml
cp -r  ./corpus-label/$tempCfgPath/$agentName ./chatbot-config/configs/users/$agentName
cp -r  ./corpus-label/$tempCfgPath/$agentName.yaml ./chatbot-config/configs/users/$agentName.yaml 
echo "end move config file for $agentName ...." 

echo "begin dg for $agentName ...." 
cd ./chatbot-dg
sbt "run corpus-test"
cd ../
echo "dg finish for $agentName"


echo "begin fastText train for $agentName..."
cd ./chatbot-config/script
python3 fastTextTrain.py users/$agentName
echo "end fastText train for $agentName"

echo "begin train slot model for $agentName..."
python3 train2.py users/$agentName -t slot
echo "end train slot model for $agentName"

cd ../../