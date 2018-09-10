#！/bin/bash 
tempCfgPath="%1"
user="%2"
agentName="%3"
echo "begin publish for $user $agentName ..."
cd ../

echo "begin move config file for $agentName ...." 
rm -rf ./chatbot-config/configs/users/$user/$agentName
rm -rf ./chatbot-config/configs/users/$user/$agentName.yaml
mkdir -p ./chatbot-config/configs/users/$user/
cp -r  ./corpus-label/$tempCfgPath/$agentName ./chatbot-config/configs/users/$user/$agentName
cp -r  ./corpus-label/$tempCfgPath/$agentName.yaml ./chatbot-config/configs/users/$user/$agentName.yaml 
rm -rf  ./corpus-label/$tempCfgPath/
echo "end move config file for $agentName ...." 

echo "begin dg for $agentName ...." 
cd ./chatbot-dg
sbt "run --user $user $agentName"
cd ../
echo "dg finish for $agentName"


echo "begin fastText train for $agentName..."
cd ./chatbot-config/script
python3 fastTextTrain.py users/$user/$agentName
echo "end fastText train for $agentName"

echo "begin train slot model for $agentName..."
python3 train2.py users/$user/$agentName -t slot
echo "end train slot model for $agentName"

cd ../../