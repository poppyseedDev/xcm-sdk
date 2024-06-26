// Contains detailed structure of XCM call construction for Altair Parachain

import {
  type IXTokensTransfer,
  Version,
  type XTokensTransferInput,
  type Extrinsic,
  type TSerializedApiCall
} from '../../types'
import ParachainNode from '../ParachainNode'
import XTokensTransferImpl from '../XTokensTransferImpl'

class Altair extends ParachainNode implements IXTokensTransfer {
  constructor() {
    super('Altair', 'altair', 'kusama', Version.V1)
  }

  private static getCurrencySelection({ currency, currencyID }: XTokensTransferInput): any {
    if (currency === 'AIR') return 'Native'
    if (currency === 'KSM') return currency
    return { ForeignAsset: currencyID }
  }

  transferXTokens(input: XTokensTransferInput): Extrinsic | TSerializedApiCall {
    const currencySelection = Altair.getCurrencySelection(input)
    return XTokensTransferImpl.transferXTokens(input, currencySelection)
  }
}

export default Altair
