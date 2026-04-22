// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CeloTasks} from "../src/CeloTasks.sol";

contract DeployCeloTasks is Script {
    // cUSD on Celo Mainnet
    address constant CUSD_MAINNET  = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    // cUSD on Alfajores testnet
    address constant CUSD_ALFAJORES = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    function run() external {
        // Pick cUSD address based on chain
        address cusd = block.chainid == 42220 ? CUSD_MAINNET : CUSD_ALFAJORES;

        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        CeloTasks celoTasks = new CeloTasks(cusd);

        vm.stopBroadcast();

        console.log("CeloTasks deployed at:", address(celoTasks));
        console.log("cUSD address used:    ", cusd);
        console.log("Chain ID:             ", block.chainid);
    }
}
