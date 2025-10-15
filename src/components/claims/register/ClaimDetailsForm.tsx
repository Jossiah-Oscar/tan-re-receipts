// import { ClaimDetails } from '@/store/useClaimRegisterStore';
// import { validateClaimDetails } from '@/utils/claimCalculations';
//
// interface ClaimDetailsFormProps {
//     claimDetails: ClaimDetails;
//     onUpdate: (details: Partial<ClaimDetails>) => void;
//     onNext: () => void;
// }
//
// export default function ClaimDetailsForm({ claimDetails, onUpdate, onNext }: ClaimDetailsFormProps) {
//     const isValid = validateClaimDetails(claimDetails);
//
//     return (
//         <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-semibold mb-6">Enter Claim Details</h2>
//
//             <div className="grid grid-cols-2 gap-6 mb-6">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Date of Loss <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="date"
//                         value={claimDetails.dateOfLoss}
//                         onChange={(e) => onUpdate({ dateOfLoss: e.target.value })}
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>
//
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Date Received <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="date"
//                         value={claimDetails.dateReceived}
//                         onChange={(e) => onUpdate({ dateReceived: e.target.value })}
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>
//
//                 <div className="col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Original Insured <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         value={claimDetails.originalInsured}
//                         onChange={(e) => onUpdate({ originalInsured: e.target.value })}
//                         placeholder="Enter insured name"
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>
//
//                 <div className="col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Cause of Loss <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                         value={claimDetails.causeOfLoss}
//                         onChange={(e) => onUpdate({ causeOfLoss: e.target.value })}
//                         placeholder="Describe the cause of loss"
//                         rows={3}
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>
//
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Current Reserve (TZS) <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         value={claimDetails.currentReserve}
//                         onChange={(e) => onUpdate({ currentReserve: e.target.value })}
//                         placeholder="0.00"
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>
//
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Salvage (TZS)
//                     </label>
//                     <input
//                         type="text"
//                         value={claimDetails.salvage}
//                         onChange={(e) => onUpdate({ salvage: e.target.value })}
//                         placeholder="0.00"
//                         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//             </div>
//
//             {!isValid && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
//                     <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                     </svg>
//                     <p className="text-sm text-yellow-800">
//                         Please fill in all required fields before continuing to search for contracts.
//                     </p>
//                 </div>
//             )}
//
//             <button
//                 onClick={onNext}
//                 disabled={!isValid}
//                 className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
//             >
//                 Continue to Search Contracts
//             </button>
//         </div>
//     );
// }
