import { RegisteredClaim } from '@/store/useClaimRegisterStore';

interface ClaimsSummaryProps {
    claims: RegisteredClaim[];
}

export default function ClaimsSummary({ claims }: ClaimsSummaryProps) {
    const totalTanreTZS = claims.reduce((sum, c) => sum + c.tanreTZS, 0);
    const totalRetroAmount = claims.reduce((sum, c) => sum + c.retroAmount, 0);
    const totalRetention = claims.reduce((sum, c) => sum + c.tanreRetention, 0);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Summary</h3>
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Claims</p>
                    <p className="text-2xl font-bold text-blue-600">{claims.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total TANRE TZS</p>
                    <p className="text-2xl font-bold text-green-600">
                        {totalTanreTZS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Retro Amount</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {totalRetroAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Retention</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {totalRetention.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
