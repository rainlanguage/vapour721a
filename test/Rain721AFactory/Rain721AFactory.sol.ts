import { artifacts, ethers } from "hardhat";
import { Rain721A, ConstructorConfigStruct, StateConfigStruct, TimeBoundStruct, InitializeConfigStruct } from "../../typechain/Rain721A";
import { AllStandardOpsStateBuilder } from "../../typechain/AllStandardOpsStateBuilder";
import { ReserveToken } from "../../typechain/ReserveToken";
import { Rain721AFactory } from "../../typechain/Rain721AFactory";
import { Rain1155, price, condition, Type, Conditions } from "rain-game-sdk";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { eighteenZeros, getEventArgs} from "../utils"
import { expect } from "chai";

export let rain721a1: Rain721A;
export let rain721a2: Rain721A;
export let SDK: Rain1155;
export let rain721AFactory: Rain721AFactory;
export let USDT: ReserveToken;
export let stateBuilder: AllStandardOpsStateBuilder;

export let factoryDeployer: SignerWithAddress,
  signer1: SignerWithAddress,
  signer2: SignerWithAddress,
  recipient_: SignerWithAddress,
  owner_: SignerWithAddress

describe("Rain721AFactory Test", () => {
  before(async () => {
    const signers = await ethers.getSigners();
    factoryDeployer = signers[0];
    signer1 = signers[1];
    signer2 = signers[2];
    recipient_ = signers[3];
    owner_ = signers[4];

    const stateBuilderFactory = await ethers.getContractFactory(
      "AllStandardOpsStateBuilder"
    );
    stateBuilder = await stateBuilderFactory.deploy() as AllStandardOpsStateBuilder;
    await stateBuilder.deployed();

    const Rain721AFactory = await ethers.getContractFactory("Rain721AFactory");

    rain721AFactory = await Rain721AFactory.connect(factoryDeployer).deploy() as Rain721AFactory;

    await rain721AFactory.deployed();

    const stableCoins = await ethers.getContractFactory("ReserveToken");

    USDT = await stableCoins.deploy() as ReserveToken;
    await USDT.deployed();
  });

  it("Factory should be deployed correctly",async () => {
    expect(rain721AFactory.address).to.be.not.null;
  });

  it("Signer1 should be able create child.",async () => {

    const priceConfig1: price[] = [
      {
        currency: {
          type: Type.ERC20,
          address: USDT.address
        },
        amount: ethers.BigNumber.from("10" + eighteenZeros)
      }
    ];

    const canMintConfig1: condition[] = [
      {
        type: Conditions.NONE
      }
    ];

    const [vmStateConfig_, currencies_] = Rain1155.generateScript([canMintConfig1], priceConfig1);
    
    let timeBound1: TimeBoundStruct = {
      baseDuration: 60,
      maxExtraTime: 60
    }

    const constructorConfig1: ConstructorConfigStruct = {
      name: "RAIN1",
      symbol: "RN1",
      supplyLimit: 1000,
      recipient: recipient_.address,
      owner: owner_.address,
      defaultURI: "DEFAULT_URI",
      baseURI: "BASE_URI",
      timeBound: timeBound1
    }

    const initialiseConfig1: InitializeConfigStruct = {
      vmStateBuilder: stateBuilder.address,
      vmStateConfig: vmStateConfig_,
      currencies: currencies_
    }
    const child1Tx = await rain721AFactory.connect(signer1).createChildTyped(constructorConfig1, initialiseConfig1);

    const [sender, child] = await getEventArgs(child1Tx, "NewChild", rain721AFactory);

    expect(sender).to.equals(rain721AFactory.address);
    expect(child).to.be.not.null;

    rain721a1 = await ethers.getContractAt((await artifacts.readArtifact("Rain721A")).abi, child) as Rain721A;

    const constructorConfig_1 = await getEventArgs(child1Tx, "Construct", rain721a1);
    const {name, symbol, recipient, owner, baseURI, defaultURI, timeBound} = constructorConfig_1[0];
    expect(name).to.equals(constructorConfig1.name);
    expect(symbol).to.equals(constructorConfig1.symbol);
    expect(recipient).to.equals(constructorConfig1.recipient);
    expect(owner).to.equals(constructorConfig1.owner);
    expect(baseURI).to.equals(constructorConfig1.baseURI);
    expect(defaultURI).to.equals(constructorConfig1.defaultURI);
    expect(timeBound.baseDuration).to.deep.equals(constructorConfig1.timeBound.baseDuration);
    expect(timeBound.maxExtraTime).to.deep.equals(constructorConfig1.timeBound.maxExtraTime);

    expect(await rain721a1.name()).to.equals(constructorConfig1.name);
    expect(await rain721a1.symbol()).to.equals(constructorConfig1.symbol);
    
    const initialiseConfig_1 = await getEventArgs(child1Tx, "Initialize", rain721a1);
    const {vmStateConfig, vmStateBuilder, currencies} = initialiseConfig_1[0];
    
    const eventVmState: StateConfigStruct = {
      sources: vmStateConfig.sources,
      constants: vmStateConfig.constants
    }

    for(let i=0;i<initialiseConfig1.currencies.length;i++)
      expect(await rain721a1.currencies(i)).to.equals(initialiseConfig1.currencies[i]);

    expect(vmStateBuilder).to.equals(initialiseConfig1.vmStateBuilder);
  });

  it("Signer2 should be able create child.",async () => {

    const priceConfig2: price[] = [
      {
        currency: {
          type: Type.ERC20,
          address: USDT.address
        },
        amount: ethers.BigNumber.from("10" + eighteenZeros)
      }
    ];

    const canMintConfig2: condition[] = [
      {
        type: Conditions.ERC20BALANCE,
        address: USDT.address,
        balance: ethers.BigNumber.from("100" + eighteenZeros)
      }
    ];

    const [ vmStateConfig_, currencies_] = Rain1155.generateScript([canMintConfig2], priceConfig2);

    let timeBound1: TimeBoundStruct = {
      baseDuration: 60,
      maxExtraTime: 60
    }

    const constructorConfig2: ConstructorConfigStruct = {
      name: "RAIN2",
      symbol: "RN2",
      supplyLimit: 500,
      recipient: recipient_.address,
      owner: owner_.address,
      defaultURI: "DEFAULT_URI1",
      baseURI: "BASE_URI1",
      timeBound: timeBound1
    }

    const initialiseConfig2: InitializeConfigStruct = {
      vmStateBuilder: stateBuilder.address,
      vmStateConfig: vmStateConfig_,
      currencies: currencies_
    }


    const child2Tx = await rain721AFactory.connect(signer2).createChildTyped(constructorConfig2, initialiseConfig2);

    const [sender, child] = await getEventArgs(child2Tx, "NewChild", rain721AFactory);

    expect(sender).to.equals(rain721AFactory.address);
    expect(child).to.be.not.null;

    rain721a2 = await ethers.getContractAt((await artifacts.readArtifact("Rain721A")).abi, child) as Rain721A;

    const constructorConfig_2 = await getEventArgs(child2Tx, "Construct", rain721a2);
    const {name, symbol, recipient, owner, baseURI, defaultURI, timeBound} = constructorConfig_2[0];
    expect(name).to.equals(constructorConfig2.name);
    expect(symbol).to.equals(constructorConfig2.symbol);
    expect(recipient).to.equals(constructorConfig2.recipient);
    expect(owner).to.equals(constructorConfig2.owner);
    expect(baseURI).to.equals(constructorConfig2.baseURI);
    expect(defaultURI).to.equals(constructorConfig2.defaultURI);
    expect(timeBound.baseDuration).to.deep.equals(constructorConfig2.timeBound.baseDuration);
    expect(timeBound.maxExtraTime).to.deep.equals(constructorConfig2.timeBound.maxExtraTime);

    expect(await rain721a2.name()).to.equals(constructorConfig2.name);
    expect(await rain721a2.symbol()).to.equals(constructorConfig2.symbol);
    
    const initialiseConfig_1 = await getEventArgs(child2Tx, "Initialize", rain721a2    );
    const {vmStateConfig, vmStateBuilder, currencies} = initialiseConfig_1[0];
    
    const eventVmState: StateConfigStruct = {
      sources: vmStateConfig.sources,
      constants: vmStateConfig.constants
    }

    for(let i=0;i<initialiseConfig2.currencies.length;i++)
      expect(await rain721a1.currencies(i)).to.equals(initialiseConfig2.currencies[i]);

    expect(vmStateBuilder).to.equals(initialiseConfig2.vmStateBuilder);
  });
});