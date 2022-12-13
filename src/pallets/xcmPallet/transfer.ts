import type { ApiPromise } from '@polkadot/api'
import { Extrinsic, TNode, TScenario } from '../../types'
import { handleAddress, selectLimit, getFees, constructXTokens, getAvailableXCMPallet, constructPolkadotXCM, createHeaderPolkadotXCM, createCurrencySpecification } from '../../utils'
import { hasSupportForAsset } from '../assets'
import { InvalidCurrencyError } from './InvalidCurrencyError'

export function send(
  api: ApiPromise,
  origin: TNode,
  currency: string,
  currencyID: number,
  amount: any,
  to: string,
  destination?: number
): Extrinsic {
  if (!hasSupportForAsset(origin, currency)) { throw new InvalidCurrencyError(`Node ${origin} does not support currency ${currency}.`) }

  const type: TScenario = destination ? 'ParaToPara' : 'ParaToRelay'
  const pallet = getAvailableXCMPallet(origin)
  if (pallet === 'xTokens' || pallet === 'ormlXTokens') {
    return constructXTokens(
      api,
      origin,
      currencyID,
      currency,
      amount,
      handleAddress(type, 'xTokens', api, to, destination),
      getFees(type)
    )
  } else if (pallet === 'polkadotXCM' || pallet === 'relayerXcm') {
    // Specific node requirements
    if ((origin === 'Statemint' || origin === 'Statemine') && type === 'ParaToPara') {
      return constructPolkadotXCM(
        api,
        origin,
        createHeaderPolkadotXCM(type, destination),
        handleAddress(type, 'polkadotXCM', api, to, destination),
        createCurrencySpecification(amount, type, origin, currencyID),
        type
      )
    } else if ((origin === 'Darwinia' || origin === 'Crab') && type === 'ParaToPara') {
      return constructPolkadotXCM(
        api,
        origin,
        createHeaderPolkadotXCM(type, destination),
        handleAddress(type, 'polkadotXCM', api, to, destination),
        createCurrencySpecification(amount, type, origin),
        type
      )
    } else if (origin === 'Quartz' && type === 'ParaToPara') {
      return constructPolkadotXCM(
        api,
        origin,
        createHeaderPolkadotXCM(type, destination, origin),
        handleAddress(type, 'polkadotXCM', api, to, destination, origin),
        createCurrencySpecification(amount, type, origin),
        type
      )
    }

    return constructPolkadotXCM(
      api,
      origin,
      createHeaderPolkadotXCM(type, destination),
      handleAddress(type, 'polkadotXCM', api, to, destination),
      createCurrencySpecification(amount, type),
      type
    )
  }
  throw new Error(`Invalid pallet: ${pallet}`)
}

export function transferRelayToPara(
  api: ApiPromise,
  destination: number,
  amount: any,
  to: string
): Extrinsic {
  return api.tx.xcmPallet.reserveTransferAssets(
    createHeaderPolkadotXCM('RelayToPara', destination),
    handleAddress('RelayToPara', '', api, to, destination),
    createCurrencySpecification(amount, 'RelayToPara'),
    0
  )
}

export function limitedTransferRelayToPara(
  api: ApiPromise,
  destination: number,
  amount: any,
  to: string,
  limit: number,
  isLimited: boolean
): Extrinsic {
  return api.tx.xcmPallet.limitedReserveTransferAssets(
    createHeaderPolkadotXCM('RelayToPara', destination),
    handleAddress('RelayToPara', '', api, to, destination),
    createCurrencySpecification(amount, 'RelayToPara'),
    0,
    selectLimit(limit, isLimited)
  )
}
