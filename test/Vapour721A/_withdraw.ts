import {expect} from "chai";
import {ethers} from "hardhat";
import {StateConfig, VM} from "rain-sdk";
import {
	BuyConfigStruct,
	Vapour721A,
	WithdrawEvent,
} from "../../typechain/Vapour721A";
import {InitializeConfigStruct} from "../../typechain/Vapour721AFactory";
import {
	buyer0,
	buyer1,
	buyer2,
	owner,
	vapour721AFactory,
	recipient,
	currency,
	buyer7,
} from "../1_setup";
import {
	BN,
	concat,
	eighteenZeros,
	getBalance,
	getChild,
	getEventArgs,
	op,
	Opcode,
	ZERO_ADDRESS,
} from "../utils";

let vapour721A: Vapour721A;
let vapour721AInitializeConfig: InitializeConfigStruct;
const nftPrice = BN(1);
let totalWithdrawn = BN(0);

describe("Token withdraw tests", () => {
	before(async () => {
		totalWithdrawn = BN(0);
		const vmStateConfig: StateConfig = {
			sources: [concat([op(Opcode.VAL, 0), op(Opcode.VAL, 1)])],
			constants: [20, nftPrice],
			stackLength: 2,
			argumentsLength: 0,
		};

		vapour721AInitializeConfig = {
			name: "nft",
			symbol: "NFT",
			baseURI: "BASE_URI",
			supplyLimit: 100,
			recipient: recipient.address,
			owner: owner.address,
			royaltyBPS: 1000,
			admin: buyer0.address,
			currency: currency.address,
			vmStateConfig: vmStateConfig,
		};

		const deployTrx = await vapour721AFactory.createChildTyped(
			vapour721AInitializeConfig
		);
		const child = await getChild(vapour721AFactory, deployTrx);
		vapour721A = (await ethers.getContractAt(
			"Vapour721A",
			child
		)) as Vapour721A;
	});

	it("should withdraw the correct amount for one purchase", async () => {
		await currency.connect(buyer0).mintTokens(10);
		await currency
			.connect(buyer0)
			.approve(vapour721A.address, ethers.BigNumber.from(nftPrice));

		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: 1,
			maximumPrice: BN(10),
		};

		await vapour721A.connect(buyer0).mintNFT(buyConfig);

		expect(await vapour721A.balanceOf(buyer0.address)).to.equals(1);

		const recipientBalanceBefore = await currency.balanceOf(recipient.address);

		const withdrawTx = await vapour721A.connect(recipient).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await currency.balanceOf(recipient.address);

		expect(withdrawer).to.equals(recipient.address);
		expect(amountWithdrawn).to.equals(nftPrice);
		expect(_totalWithdrawn).to.equals(totalWithdrawn.add(nftPrice));
		expect(recipientBalanceBefore.add(nftPrice)).to.equals(
			recipientBalanceAfter
		);

		totalWithdrawn = _totalWithdrawn;
	});

	it("should withdraw the correct amount for multiple purchases from multiple buyers", async () => {
		const units = ethers.BigNumber.from(5);
		const recipientBalanceBefore = await currency.balanceOf(recipient.address);

		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: units,
			maximumPrice: units.mul(nftPrice),
		};

		// first buyer
		await currency.connect(buyer1).mintTokens(units);
		await currency
			.connect(buyer1)
			.approve(vapour721A.address, units.mul(nftPrice));

		await vapour721A.connect(buyer1).mintNFT(buyConfig);
		expect(await vapour721A.balanceOf(buyer1.address)).to.equals(units);

		const buyer1Cost = nftPrice.mul(units);

		// second buyer
		await currency.connect(buyer2).mintTokens(units);
		await currency
			.connect(buyer2)
			.approve(vapour721A.address, units.mul(nftPrice));

		await vapour721A.connect(buyer2).mintNFT(buyConfig);
		expect(await vapour721A.balanceOf(buyer2.address)).to.equals(units);

		const buyer2Cost = nftPrice.mul(units);

		const withdrawTx = await vapour721A.connect(recipient).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await currency.balanceOf(recipient.address);

		expect(withdrawer).to.equals(recipient.address);
		expect(amountWithdrawn).to.equals(buyer1Cost.add(buyer2Cost));
		expect(_totalWithdrawn).to.equals(
			totalWithdrawn.add(buyer1Cost).add(buyer2Cost)
		);
		expect(recipientBalanceBefore.add(buyer1Cost).add(buyer2Cost)).to.equals(
			recipientBalanceAfter
		);

		totalWithdrawn = _totalWithdrawn;
	});

	// it("should not allow withdrawals by non-recipient", async () => {
	// 	const units = ethers.BigNumber.from(5);

	// 	await currency.connect(buyer1).mintTokens(units);
	// 	await currency.connect(buyer1).approve(vapour721A.address, nftPrice.mul(units));

	// 	const buyConfig: BuyConfigStruct = {
	// 		minimumUnits: 1,
	// 		desiredUnits: units,
	// 		maximumPrice: nftPrice,
	// 	};

	// 	await vapour721A.connect(buyer1).mintNFT(buyConfig);

	// 	await expect(vapour721A.connect(buyer0).withdraw()).revertedWith("RECIPIENT_ONLY")

	// 	const withdrawTx = await vapour721A.connect(recipient).withdraw()

	// 	const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
	// 		withdrawTx,
	// 		"Withdraw",
	// 		vapour721A
	// 	)) as WithdrawEvent["args"];

	// 	expect(await vapour721A._amountPayable()).to.equals(ethers.BigNumber.from(0));

	// 	totalWithdrawn = _totalWithdrawn
	// });

	it("should withdraw the correct amount after recipient has been changed", async () => {
		// mint another 5 nfts
		const units = ethers.BigNumber.from(5);

		await currency.connect(buyer2).mintTokens(units);
		await currency
			.connect(buyer2)
			.approve(vapour721A.address, nftPrice.mul(units));

		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: units,
			maximumPrice: nftPrice,
		};

		await vapour721A.connect(buyer2).mintNFT(buyConfig);

		// set a new recipient
		await vapour721A.connect(recipient).setRecipient(buyer1.address);

		const recipientBalanceBefore = await currency.balanceOf(buyer1.address);

		const withdrawTx = await vapour721A.connect(buyer1).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await currency.balanceOf(buyer1.address);

		expect(withdrawer).to.equals(buyer1.address);
		expect(amountWithdrawn).to.equals(nftPrice.mul(units));
		expect(_totalWithdrawn).to.equals(totalWithdrawn.add(nftPrice.mul(units)));
		expect(recipientBalanceBefore.add(nftPrice.mul(units))).to.equals(
			recipientBalanceAfter
		);
	});
});

describe("Native Token withdraw tests", () => {
	before(async () => {
		totalWithdrawn = BN(0);
		const vmStateConfig: StateConfig = {
			sources: [concat([op(Opcode.VAL, 0), op(Opcode.VAL, 1)])],
			constants: [20, nftPrice],
			stackLength: 2,
			argumentsLength: 0,
		};

		vapour721AInitializeConfig = {
			name: "nft",
			symbol: "NFT",
			baseURI: "BASE_URI",
			supplyLimit: 100,
			recipient: recipient.address,
			owner: owner.address,
			royaltyBPS: 1000,
			admin: buyer0.address,
			currency: ZERO_ADDRESS,
			vmStateConfig: vmStateConfig,
		};

		const deployTrx = await vapour721AFactory.createChildTyped(
			vapour721AInitializeConfig
		);
		const child = await getChild(vapour721AFactory, deployTrx);
		vapour721A = (await ethers.getContractAt(
			"Vapour721A",
			child
		)) as Vapour721A;
	});

	it("should withdraw the correct amount for one purchase", async () => {
		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: 1,
			maximumPrice: BN(10),
		};

		await vapour721A
			.connect(buyer0)
			.mintNFT(buyConfig, {value: buyConfig.maximumPrice});

		expect(await vapour721A.balanceOf(buyer0.address)).to.equals(1);

		const recipientBalanceBefore = await getBalance(ZERO_ADDRESS, recipient);

		const withdrawTx = await vapour721A.connect(buyer7).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await getBalance(ZERO_ADDRESS, recipient);

		expect(withdrawer).to.equals(buyer7.address);
		expect(amountWithdrawn).to.equals(nftPrice);
		expect(_totalWithdrawn).to.equals(totalWithdrawn.add(nftPrice));
		expect(recipientBalanceBefore.add(nftPrice)).to.equals(
			recipientBalanceAfter
		);

		totalWithdrawn = _totalWithdrawn;
	});

	it("should withdraw the correct amount for multiple purchases from multiple buyers", async () => {
		const units = ethers.BigNumber.from(5);
		const recipientBalanceBefore = await getBalance(ZERO_ADDRESS, recipient);

		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: units,
			maximumPrice: units.mul(nftPrice),
		};

		// first buyer
		await vapour721A
			.connect(buyer1)
			.mintNFT(buyConfig, {value: buyConfig.maximumPrice});
		expect(await vapour721A.balanceOf(buyer1.address)).to.equals(units);

		const buyer1Cost = nftPrice.mul(units);

		// second buyer

		await vapour721A
			.connect(buyer2)
			.mintNFT(buyConfig, {value: buyConfig.maximumPrice});
		expect(await vapour721A.balanceOf(buyer2.address)).to.equals(units);

		const buyer2Cost = nftPrice.mul(units);

		const withdrawTx = await vapour721A.connect(buyer7).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await getBalance(ZERO_ADDRESS, recipient);

		expect(withdrawer).to.equals(buyer7.address);
		expect(amountWithdrawn).to.equals(buyer1Cost.add(buyer2Cost));
		expect(_totalWithdrawn).to.equals(
			totalWithdrawn.add(buyer1Cost).add(buyer2Cost)
		);
		expect(recipientBalanceBefore.add(buyer1Cost).add(buyer2Cost)).to.equals(
			recipientBalanceAfter
		);

		totalWithdrawn = _totalWithdrawn;
	});

	// it("should not allow withdrawals by non-recipient", async () => {
	// 	const units = ethers.BigNumber.from(5);

	// 	const buyConfig: BuyConfigStruct = {
	// 		minimumUnits: 1,
	// 		desiredUnits: units,
	// 		maximumPrice: nftPrice,
	// 	};

	// 	await vapour721A.connect(buyer1).mintNFT(buyConfig, {value: buyConfig.maximumPrice});

	// 	await expect(vapour721A.connect(buyer0).withdraw()).revertedWith("RECIPIENT_ONLY")

	// 	const withdrawTx = await vapour721A.connect(recipient).withdraw()

	// 	const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
	// 		withdrawTx,
	// 		"Withdraw",
	// 		vapour721A
	// 	)) as WithdrawEvent["args"];

	// 	expect(await vapour721A._amountPayable()).to.equals(ethers.BigNumber.from(0));

	// 	totalWithdrawn = _totalWithdrawn
	// });

	it("should withdraw the correct amount after recipient has been changed", async () => {
		// mint another 5 nfts
		const units = ethers.BigNumber.from(5);

		const buyConfig: BuyConfigStruct = {
			minimumUnits: 1,
			desiredUnits: units,
			maximumPrice: BN(5),
		};

		await vapour721A
			.connect(buyer2)
			.mintNFT(buyConfig, {value: buyConfig.maximumPrice});

		// set a new recipient
		await vapour721A.connect(recipient).setRecipient(buyer1.address);

		const recipientBalanceBefore = await getBalance(ZERO_ADDRESS, buyer1);

		const withdrawTx = await vapour721A.connect(recipient).withdraw();

		const [withdrawer, amountWithdrawn, _totalWithdrawn] = (await getEventArgs(
			withdrawTx,
			"Withdraw",
			vapour721A
		)) as WithdrawEvent["args"];

		const recipientBalanceAfter = await getBalance(ZERO_ADDRESS, buyer1);

		expect(withdrawer).to.equals(recipient.address);
		expect(amountWithdrawn).to.equals(nftPrice.mul(units));
		expect(_totalWithdrawn).to.equals(totalWithdrawn.add(nftPrice.mul(units)));
		expect(recipientBalanceBefore.add(nftPrice.mul(units))).to.equals(
			recipientBalanceAfter
		);
	});
});
