import { ethers } from "hardhat";
import { Rain721A, TimeBoundStruct, ConstructorConfigStruct, InitializeConfigStruct, OwnershipTransferredEvent } from "../../typechain/Rain721A";
import { getChild, getEventArgs } from "../utils";
import { condition, Conditions, price, Rain1155, Type } from "rain-game-sdk";
import { expect } from "chai";
import { buyer0, config, owner, rain721aFactory, recipient, rTKN } from "../1_setup";
 
let rain721aConstructorConfig: ConstructorConfigStruct;
let rain721aInitializeConfig: InitializeConfigStruct;
let rain721a: Rain721A;

describe("Rain721A Initialise test", () => {
    before(async () => {
        const canMint: condition[] = [
            {
                type: Conditions.NONE
            }
        ];
    
        const prices: price[] = [
            {
                currency: {
                    type: Type.ERC20,
                    address: rTKN.address
                },
                amount: ethers.BigNumber.from("1" )
            }
        ];
    
        const [vmStateConfig_, currencies_] = Rain1155.generateScript([canMint], prices);
        
        const timeBound: TimeBoundStruct = {
            baseDuration: 60,
            maxExtraTime: 60
        }
    
        rain721aConstructorConfig = {
            name: "nft",
            symbol: "NFT",
            defaultURI: "DEFAULT_URI",
            baseURI: "BASE_URI",
            supplyLimit: 36,
            recipient: recipient.address,
            owner: owner.address,
            timeBound: timeBound
        }
    
        rain721aInitializeConfig = {
            vmStateBuilder: config.allStandardOpsStateBuilder,
            vmStateConfig: vmStateConfig_,
            currencies: currencies_,
        }

        const deployTrx = await rain721aFactory.createChildTyped(rain721aConstructorConfig, rain721aInitializeConfig);
        const child = await getChild(rain721aFactory, deployTrx);

        rain721a = await ethers.getContractAt("Rain721A", child) as Rain721A;
    });

    it("Should be the correct owner",async () => {
        expect(await (await rain721a.owner())).to.equals(rain721aConstructorConfig.owner);
    });

    it("Should fail to change owner with non-Owner address",async () => {
       await expect(rain721a.connect(buyer0).transferOwnership(recipient.address)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Should able to change the owner",async () => {
       const trx = await rain721a.connect(owner).transferOwnership(recipient.address);

       expect(await rain721a.owner()).to.equals(recipient.address);
    });
});