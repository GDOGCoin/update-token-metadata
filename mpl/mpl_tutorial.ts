import { createV1, updateV1 ,Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply, UpdateV1InstructionData, UpdateV1InstructionAccounts, Data} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import * as bs58 from "bs58";

const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  
export function loadWalletKey(keypairFile:string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

const INITIALIZE = true;

async function main(){
    console.log("let's name some token-22 tokens in 2024!");
    const myKeypair = loadWalletKey("/root/.config/solana/id.json");
    const mint = new web3.PublicKey("CpYsdmwq5nhYk25CyaRvQvmYX7fBrBeuDW7qFMPKYMmZ");

    const umi = createUmi("https://api.mainnet-beta.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "FitDog Coin", 
        symbol: "FITD",
        uri: "https://raw.githubusercontent.com/GDOGCoin/GDOG/main/metadata.json",
    }
    if(INITIALIZE){
        const onChainData = {
            ...ourMetadata,
            // we don't need that
            sellerFeeBasisPoints: percentAmount(0,2),
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: UpdateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data: CreateV1InstructionData = {
            ...onChainData,
            isMutable: true,
            discriminator: 0,
            tokenStandard: TokenStandard.Fungible,
            collectionDetails: none<CollectionDetails>(),
            ruleSet: none<PublicKey>(),
            createV1Discriminator: 0,
            primarySaleHappened: true,
            decimals: none<number>(),
            printSupply: none<PrintSupply>(),
        }
        const txid = await updateV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    } else {
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: 0,
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: UpdateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
        }
        const data = {
            discriminator: 0,
            data: some<Data>(onChainData),
            updateV1Discriminator: 0,
        }
        const txid = await updateV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    }


}

main();