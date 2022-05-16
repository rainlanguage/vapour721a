/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface ITierInterface extends utils.Interface {
  functions: {
    "report(address)": FunctionFragment;
    "setTier(address,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "report", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setTier",
    values: [string, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "report", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setTier", data: BytesLike): Result;

  events: {
    "TierChange(address,address,uint256,uint256,bytes)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TierChange"): EventFragment;
}

export type TierChangeEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, string],
  {
    sender: string;
    account: string;
    startTier: BigNumber;
    endTier: BigNumber;
    data: string;
  }
>;

export type TierChangeEventFilter = TypedEventFilter<TierChangeEvent>;

export interface ITier extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ITierInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    report(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    setTier(
      account: string,
      endTier: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  report(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  setTier(
    account: string,
    endTier: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    report(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    setTier(
      account: string,
      endTier: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "TierChange(address,address,uint256,uint256,bytes)"(
      sender?: null,
      account?: null,
      startTier?: null,
      endTier?: null,
      data?: null
    ): TierChangeEventFilter;
    TierChange(
      sender?: null,
      account?: null,
      startTier?: null,
      endTier?: null,
      data?: null
    ): TierChangeEventFilter;
  };

  estimateGas: {
    report(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    setTier(
      account: string,
      endTier: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    report(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setTier(
      account: string,
      endTier: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
