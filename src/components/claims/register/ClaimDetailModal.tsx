import { RegisteredClaim, convertDateToDDMMYYYY } from '@/store/useClaimRegisterStore';

interface ClaimDetailModalProps {
    claim: RegisteredClaim;
    onClose: () => void;
}

export default function ClaimDetailModal({ claim, onClose }: ClaimDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Claim Details - {claim.claimId}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-lg mb-4">Claim Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-500">Claim ID</span>
                                <p className="font-semibold text-blue-600">{claim.claimId}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Date Registered</span>
                                <p className="font-semibold">{convertDateToDDMMYYYY(claim.dateRegistered)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Date of Loss</span>
                                <p className="font-semibold">{claim.dateOfLoss ? convertDateToDDMMYYYY(claim.dateOfLoss) : '(Not provided)'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Date Received</span>
                                <p className="font-semibold">{convertDateToDDMMYYYY(claim.dateReceived)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Original Insured</span>
                                <p className="font-semibold">{claim.originalInsured}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Current Reserve (TZS)</span>
                                <p className="font-semibold">{claim.currentReserve.toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Salvage (TZS)</span>
                                <p className="font-semibold">{claim.salvage.toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Net Amount (TZS)</span>
                                <p className="font-semibold text-blue-600">{claim.netAmount.toLocaleString()}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-sm text-gray-500">Cause of Loss</span>
                                <p className="font-semibold">{claim.causeOfLoss}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-lg mb-4">Financial Summary</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">Total Share Signed</span>
                                <p className="text-2xl font-bold text-gray-800">{claim.totalShareSigned.toFixed(2)}%</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">TANRE TZS</span>
                                <p className="text-2xl font-bold text-green-600">
                                    {claim.tanreTZS.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">Retro Amount</span>
                                <p className="text-2xl font-bold text-orange-600">
                                    {claim.retroAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">TANRE Retention</span>
                                <p className="text-2xl font-bold text-blue-600">
                                    {claim.tanreRetention.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">Retention %</span>
                                <p className="text-2xl font-bold text-gray-800">
                                    {((claim.tanreRetention / claim.tanreTZS) * 100).toFixed(2)}%
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <span className="text-sm text-gray-600">Retro %</span>
                                <p className="text-2xl font-bold text-gray-800">
                                    {((claim.retroAmount / claim.tanreTZS) * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Associated Contracts ({claim.contractCount})</h3>
                        <div className="space-y-2">
                            {claim.contracts.map((contractNum) => (
                                <div key={contractNum} className="bg-white border border-gray-200 rounded p-3">
                                    <span className="font-medium text-gray-800">Contract #{contractNum}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
