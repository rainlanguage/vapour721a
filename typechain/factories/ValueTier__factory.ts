/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ValueTier, ValueTierInterface } from "../ValueTier";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_size",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_end",
        type: "uint256",
      },
    ],
    name: "InvalidCodeAtRange",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pointer",
        type: "address",
      },
    ],
    name: "InitializeValueTier",
    type: "event",
  },
  {
    inputs: [],
    name: "tierValues",
    outputs: [
      {
        internalType: "uint256[8]",
        name: "tierValues_",
        type: "uint256[8]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610263806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c806370230b3914610030575b600080fd5b61003861004e565b604051610045919061016e565b60405180910390f35b61005661014f565b60005461006b906001600160a01b0316610083565b80602001905181019061007e91906101a0565b905090565b6060610093826001600019610099565b92915050565b6060833b806100b8575050604080516020810190915260008152610148565b808411156100d6575050604080516020810190915260008152610148565b8383101561010c5760405163162544fd60e11b815260048101829052602481018590526044810184905260640160405180910390fd5b83830384820360008282106101215782610123565b815b60408051603f8301601f19168101909152818152955090508087602087018a3c505050505b9392505050565b6040518061010001604052806008906020820280368337509192915050565b6101008101818360005b6008811015610197578151835260209283019290910190600101610178565b50505092915050565b60006101008083850312156101b457600080fd5b83601f8401126101c357600080fd5b60405181810181811067ffffffffffffffff821117156101f357634e487b7160e01b600052604160045260246000fd5b60405290830190808583111561020857600080fd5b845b8381101561022257805182526020918201910161020a565b50909594505050505056fea2646970667358221220233b2874f8fa1f0b916903b5e22252ea8f8d0a5a81730b684af640d9b7808c5964736f6c634300080a0033";

type ValueTierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ValueTierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ValueTier__factory extends ContractFactory {
  constructor(...args: ValueTierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ValueTier> {
    return super.deploy(overrides || {}) as Promise<ValueTier>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ValueTier {
    return super.attach(address) as ValueTier;
  }
  connect(signer: Signer): ValueTier__factory {
    return super.connect(signer) as ValueTier__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ValueTierInterface {
    return new utils.Interface(_abi) as ValueTierInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ValueTier {
    return new Contract(address, _abi, signerOrProvider) as ValueTier;
  }
}
