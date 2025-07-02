import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';

import minimartAbi from '~/minimartAbi';

export default defineConfig({
    out: 'src/generated.ts',
    contracts: [
        {
            name: 'minimart',
            abi: minimartAbi,
        },
    ],
    plugins: [react()],
});
