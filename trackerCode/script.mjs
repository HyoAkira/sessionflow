#!/usr/bin/env zx


const arg = process.argv[3];
const arg2 = process.argv[4];
console.log(`Argument received: ${arg}`);
await $`cp ./dist/bundle.js ../www/web/script.js`;

switch (arg) {

    case 'serial':

        await $`pnpm run bundle`;
        await $`cp ./dist/bundle.js ../www/web/script.js`;
        console.info('Script copied to ../www/web/script.js');
        process.chdir('../www/');
        console.info(`Changed directory to ${process.cwd()}`);
        if (arg2 === "restart") {
            await $`cd ${process.cwd()}&& docker-compose -f docker-compose.yaml down`;
            console.info('Docker containers stopped');
            await $`cd ${process.cwd()}&& docker-compose -f docker-compose.yaml up -d --build`;
        } else {

            await $`cd ${process.cwd()}&& docker-compose -f docker-compose.yaml up -d --build`;

        }

        console.info('Docker containers started');
        break;

}