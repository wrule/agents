import path from 'path';
import { z } from 'zod';
import { zerialize } from 'zodex';
// import axios from 'axios';

const BASE_URL = 'http://localhost:9091';

async function main() {
  // const { data } = await axios.post(path.join(BASE_URL, '/v1/chat/completions'), {
  //   messages: '鸡毛是一个有十亿财富的富翁',
  //   agentName: 'qa_cleaning_agent',
  //   output: zerialize(
  //     z.array(z.object({
  //       q: z.string().describe('问题'),
  //       a: z.string().describe('回答'),
  //     })).length(5).describe('提取的问答列表')
  //   ),
  // });
  // console.log(data);
}

main();
