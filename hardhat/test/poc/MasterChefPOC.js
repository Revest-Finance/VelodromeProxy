const ethers = hre.ethers;

async function main() {
    const Exp = await ethers.getContractFactory('ExpMasterChef');
    const exp = await Exp.deploy();

    // impersonate the largest holder of lp token
    await hre.network.provider.send(
        "hardhat_impersonateAccount",
        ["0x647481c033a4a2e816175ce115a0804adf793891"
    ]);
    const holder = ethers.provider.getSigner(
        "0x647481c033a4a2e816175ce115a0804adf793891"
    );

    const lpToken = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f"
    )

    // send some ethers to the holder
    const signers = await ethers.getSigners();
    await signers[0].sendTransaction({
        to: holder._address,
        value: ethers.utils.parseEther("1.0"),
    })

    await lpToken.connect(holder).transfer(
        exp.address,
        ethers.utils.parseEther("1000.0")
    );

    await exp.setUp();
    await exp.run();
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});