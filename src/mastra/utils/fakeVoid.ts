import { z } from 'zod';

export default z.object({
  n: z.number().min(0).max(1).describe('随机数，0或1'),
});
