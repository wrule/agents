import OpenAICompatibleProvider from '../providers/OpenAICompatibleProvider';

const main = OpenAICompatibleProvider(process.env.MODEL_NAME!);

export default main;
