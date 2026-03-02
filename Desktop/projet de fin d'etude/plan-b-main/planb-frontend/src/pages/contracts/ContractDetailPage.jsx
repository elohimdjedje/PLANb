/**
 * ContractDetailPage.jsx
 * Page de détail et de gestion d'un contrat de location PlanB.
 * Workflow : draft → tenant_signed → owner_signed → locked → payé → restitution
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, ArrowLeft, CheckCircle, Clock, Lock, DollarSign,
    PenTool, Download, Eye, AlertTriangle, Shield,
    User, Home, ChevronDown, ChevronUp, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contractService } from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n ? new Intl.NumberFormat('fr-FR').format(Number(n)) + ' XOF' : '—';

const STATUS_CONFIG = {
    draft:         { label: 'Brouillon',                color: 'bg-gray-100 text-gray-700 border-gray-200',      icon: FileText },
    tenant_signed: { label: 'Signé par le locataire',   color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: PenTool },
    owner_signed:  { label: 'Signé par le propriétaire',color: 'bg-indigo-100 text-indigo-700 border-indigo-200',icon: PenTool },
    locked:        { label: 'Verrouillé',               color: 'bg-green-100 text-green-700 border-green-200',   icon: Lock },
    archived:      { label: 'Archivé',                  color: 'bg-gray-100 text-gray-500 border-gray-200',      icon: FileText },
};

const PAYMENT_CONFIG = {
    payment_pending: { label: 'Paiement en attente', color: 'text-yellow-600' },
    payment_success: { label: 'Payé',                color: 'text-green-600' },
    payment_failed:  { label: 'Paiement échoué',     color: 'text-red-600' },
};

const RESTITUTION_CONFIG = {
    restitution_requested:  { label: 'Demande en attente',   color: 'text-orange-600' },
    restitution_processing: { label: 'En cours de traitement',color: 'text-blue-600' },
    restitution_validated:  { label: 'Validée',              color: 'text-green-600' },
    restitution_completed:  { label: 'Complétée',            color: 'text-emerald-600' },
};

// ── Signature canvas ──────────────────────────────────────────────────────────
function SignatureCanvas({ onSave, onCancel }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    const startDraw = (e) => {
        setDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };
    const draw = (e) => {
        if (!drawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.stroke();
    };
    const stopDraw = () => setDrawing(false);
    const clear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    const save = () => {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Signer le contrat</h3>
                <p className="text-sm text-gray-500 mb-3">Tracez votre signature dans le cadre ci-dessous.</p>
                <canvas
                    ref={canvasRef}
                    width={380} height={160}
                    className="border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair bg-gray-50 w-full"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                />
                <div className="flex gap-3 mt-4">
                    <button onClick={clear} className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Effacer</button>
                    <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm">Annuler</button>
                    <button onClick={save} className="flex-1 py-2 bg-orange-500 rounded-xl text-white font-semibold hover:bg-orange-600 transition text-sm">Confirmer</button>
                </div>
            </div>
        </div>
    );
}

// ── Section accordion ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
                <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                    <Icon className="w-4 h-4 text-orange-500" />
                    {title}
                </span>
                {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {open && <div className="p-4">{children}</div>}
        </div>
    );
}

// ── Audit log modal ───────────────────────────────────────────────────────────
function AuditLogModal({ contractId, onClose }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        contractService.getAuditLog(contractId).then(res => {
            if (res.ok) setLogs(res.data.data || []);
            setLoading(false);
        });
    }, [contractId]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Journal d'audit immuable</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {loading && <p className="text-center text-gray-400 py-8">Chargement…</p>}
                    {!loading && logs.length === 0 && <p className="text-center text-gray-400 py-8">Aucun événement</p>}
                    {logs.map(log => (
                        <div key={log.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-gray-800">{log.description}</span>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{log.created_at}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                <span>Type : <code className="bg-gray-100 px-1 rounded">{log.event_type}</code></span>
                                {log.ip_address && <span>IP : {log.ip_address}</span>}
                                {log.user_email && <span>Par : {log.user_email}</span>}
                            </div>
                            {log.document_hash && (
                                <div className="text-xs text-gray-400 mt-1 font-mono truncate">
                                    Hash : {log.document_hash}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ContractDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contract, setContract] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [busy, setBusy]         = useState(false);

    // UI state
    const [showSignCanvas, setShowSignCanvas] = useState(false);
    const [signRole, setSignRole]             = useState(null); // 'tenant' | 'owner'
    const [showAudit, setShowAudit]           = useState(false);
    const [showPayment, setShowPayment]       = useState(false);
    const [showRestitution, setShowRestitution] = useState(false);

    // Payment form
    const [payForm, setPayForm] = useState({ rent: '', deposit: '', months: 1 });

    // Restitution form
    const [restForm, setRestForm] = useState({ decision: 'full', retained: '', notes: '' });

    // Ref pour le champ ID de transaction Kkiapay (BUG-022: éviter document.getElementById)
    const txIdRef = useRef(null);

    const loadContract = useCallback(async () => {
        try {
            const res = await contractService.get(id);
            if (res.ok) {
                setContract(res.data.data);
            } else {
                toast.error('Contrat introuvable');
                navigate(-1);
            }
        } catch (err) {
            console.error('Erreur chargement contrat:', err);
            toast.error('Impossible de charger le contrat. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { loadContract(); }, [loadContract]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!contract) return null;

    const isOwner  = contract.is_owner  === true;
    const isTenant = contract.is_tenant === true;
    const sc = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
    const StatusIcon = sc.icon;

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleSignSave = async (dataUrl) => {
        setShowSignCanvas(false);
        setBusy(true);
        const fn = signRole === 'tenant'
            ? contractService.signTenant(contract.id, dataUrl)
            : contractService.signOwner(contract.id, dataUrl);
        const res = await fn;
        setBusy(false);
        if (res.ok) {
            toast.success(signRole === 'tenant' ? 'Contrat signé !' : 'Contrat verrouillé après signature propriétaire !');
            loadContract();
        } else {
            toast.error(res.data?.error || 'Erreur de signature');
        }
    };

    const handleSetPayment = async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await contractService.setPayment(contract.id, payForm.rent, payForm.deposit, payForm.months);
        setBusy(false);
        if (res.ok) {
            toast.success('Montants saisis — le locataire peut maintenant payer');
            setShowPayment(false);
            loadContract();
        } else {
            toast.error(res.data?.error || 'Erreur');
        }
    };

    const handleConfirmPayment = async (transactionId) => {
        setBusy(true);
        const res = await contractService.confirmPayment(contract.id, transactionId);
        setBusy(false);
        if (res.ok) {
            toast.success('Paiement confirmé !');
            loadContract();
        } else {
            toast.error(res.data?.error || 'Erreur de confirmation');
        }
    };

    const handleRequestRestitution = async () => {
        if (!window.confirm('Confirmer la demande de restitution de caution ?')) return;
        setBusy(true);
        const res = await contractService.requestRestitution(contract.id);
        setBusy(false);
        if (res.ok) { toast.success('Demande soumise'); loadContract(); }
        else toast.error(res.data?.error || 'Erreur');
    };

    const handleProcessRestitution = async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await contractService.processRestitution(
            contract.id,
            restForm.decision,
            restForm.retained ? parseFloat(restForm.retained) : null,
            restForm.notes || null
        );
        setBusy(false);
        if (res.ok) {
            toast.success('Restitution traitée');
            setShowRestitution(false);
            loadContract();
        } else {
            toast.error(res.data?.error || 'Erreur');
        }
    };

    const cd = contract.contract_data || {};

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Contrat {contract.unique_contract_id}</h1>
                        <p className="text-sm text-gray-500">Réservation #{contract.booking_id}</p>
                    </div>
                </div>

                {/* Statut + badge */}
                <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${sc.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    <div>
                        <span className="font-semibold">{sc.label}</span>
                        {contract.locked_at && (
                            <p className="text-xs mt-0.5 opacity-75">Verrouillé le {new Date(contract.locked_at).toLocaleDateString('fr-FR')}</p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAudit(true)}
                        className="ml-auto text-xs underline opacity-70 hover:opacity-100 flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" /> Journal
                    </button>
                </div>

                {/* Parties */}
                <Section title="Parties" icon={User} defaultOpen>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">Propriétaire</p>
                            <p>{cd.owner?.name}</p>
                            <p className="text-gray-500">{cd.owner?.email}</p>
                            <p className="text-gray-500">{cd.owner?.phone}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">Locataire</p>
                            <p>{cd.tenant?.name}</p>
                            <p className="text-gray-500">{cd.tenant?.email}</p>
                            <p className="text-gray-500">{cd.tenant?.phone}</p>
                        </div>
                    </div>
                </Section>

                {/* Bien loué */}
                <Section title="Bien loué" icon={Home}>
                    <div className="text-sm space-y-1">
                        <p className="font-semibold">{cd.property?.title}</p>
                        <p className="text-gray-500">{cd.property?.address}, {cd.property?.city}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-gray-700">
                            <span>Du <strong>{cd.rental?.start_date}</strong></span>
                            <span>au <strong>{cd.rental?.end_date}</strong></span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1">
                            <span>Loyer : <strong>{fmt(cd.rental?.monthly_rent)}</strong></span>
                            <span>Caution : <strong>{fmt(cd.rental?.deposit)}</strong></span>
                        </div>
                    </div>
                </Section>

                {/* Signatures */}
                <Section title="Signatures" icon={PenTool} defaultOpen>
                    <div className="space-y-3 text-sm">
                        {/* Locataire */}
                        <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                            <div>
                                <p className="font-medium text-gray-800">Locataire</p>
                                {contract.is_tenant_signed
                                    ? <p className="text-green-600 text-xs">Signé le {new Date(contract.tenant_signed_at).toLocaleString('fr-FR')}</p>
                                    : <p className="text-gray-400 text-xs">Non signé</p>}
                            </div>
                            {contract.is_tenant_signed
                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                : isTenant && contract.status === 'draft'
                                    ? <button
                                        disabled={busy}
                                        onClick={() => { setSignRole('tenant'); setShowSignCanvas(true); }}
                                        className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                                    >
                                        Signer
                                    </button>
                                    : <Clock className="w-5 h-5 text-gray-300" />}
                        </div>

                        {/* Propriétaire */}
                        <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                            <div>
                                <p className="font-medium text-gray-800">Propriétaire</p>
                                {contract.is_owner_signed
                                    ? <p className="text-green-600 text-xs">Signé le {new Date(contract.owner_signed_at).toLocaleString('fr-FR')}</p>
                                    : <p className="text-gray-400 text-xs">Non signé</p>}
                            </div>
                            {contract.is_owner_signed
                                ? <CheckCircle className="w-5 h-5 text-green-500" />
                                : isOwner && contract.status === 'tenant_signed'
                                    ? <button
                                        disabled={busy}
                                        onClick={() => { setSignRole('owner'); setShowSignCanvas(true); }}
                                        className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                                    >
                                        Signer
                                    </button>
                                    : <Clock className="w-5 h-5 text-gray-300" />}
                        </div>
                    </div>
                </Section>

                {/* Paiement */}
                <Section title="Paiement" icon={DollarSign} defaultOpen={contract.is_locked}>
                    <div className="text-sm space-y-3">
                        {/* Statut paiement */}
                        {contract.payment_status && (
                            <div className={`font-semibold ${PAYMENT_CONFIG[contract.payment_status]?.color || 'text-gray-600'}`}>
                                {PAYMENT_CONFIG[contract.payment_status]?.label}
                            </div>
                        )}

                        {/* Montants */}
                        {contract.total_payment_amount && (
                            <div className="grid grid-cols-2 gap-2 text-gray-700">
                                <span>Loyer : <strong>{fmt(contract.rent_amount)}</strong></span>
                                <span>Caution : <strong>{fmt(contract.deposit_monthly_amount)} × {contract.deposit_months}</strong></span>
                                <span className="col-span-2 text-base font-bold text-gray-900">Total : {fmt(contract.total_payment_amount)}</span>
                            </div>
                        )}

                        {/* Documents */}
                        <div className="flex flex-wrap gap-2">
                            {contract.pdf_url && (
                                <a href={contract.pdf_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <Download className="w-3 h-3" /> Contrat PDF
                                </a>
                            )}
                            {contract.receipt_url && (
                                <a href={contract.receipt_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <Download className="w-3 h-3" /> Reçu
                                </a>
                            )}
                            {contract.quittance_url && (
                                <a href={contract.quittance_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <Download className="w-3 h-3" /> Quittance
                                </a>
                            )}
                        </div>

                        {/* Saisie montants (propriétaire) */}
                        {isOwner && contract.is_locked && !contract.payment_status && (
                            <button
                                onClick={() => setShowPayment(true)}
                                className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                            >
                                Définir les montants à payer
                            </button>
                        )}

                        {/* Confirmation paiement rapide (test sandbox) */}
                        {isTenant && contract.payment_status === 'payment_pending' && (
                            <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-3">
                                <p className="text-xs text-yellow-700 mb-2">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    Paiement de <strong>{fmt(contract.total_payment_amount)}</strong> en attente.
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                    Intégrez le widget Kkiapay sur votre page. Après succès, saisissez l'ID de transaction :
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        ref={txIdRef}
                                        placeholder="ID transaction Kkiapay"
                                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs"
                                    />
                                    <button
                                        disabled={busy}
                                        onClick={() => {
                                            const txId = txIdRef.current?.value.trim() ?? '';
                                            if (txId) handleConfirmPayment(txId);
                                            else toast.error('ID de transaction requis');
                                        }}
                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition disabled:opacity-50"
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Restitution */}
                {(contract.payment_status === 'payment_success') && (
                    <Section title="Restitution de caution" icon={Shield}>
                        <div className="text-sm space-y-3">
                            {contract.restitution_status && (
                                <div className={`font-semibold ${RESTITUTION_CONFIG[contract.restitution_status]?.color || 'text-gray-600'}`}>
                                    {RESTITUTION_CONFIG[contract.restitution_status]?.label}
                                </div>
                            )}

                            {contract.restitution_notes && (
                                <p className="text-gray-600 italic">"{contract.restitution_notes}"</p>
                            )}
                            {contract.restitution_retained_amount && (
                                <p>Retenue : <strong>{fmt(contract.restitution_retained_amount)}</strong></p>
                            )}

                            {contract.exit_report_url && (
                                <a href={contract.exit_report_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition w-fit">
                                    <Download className="w-3 h-3" /> Procès-verbal de sortie
                                </a>
                            )}

                            {/* Demande locataire */}
                            {isTenant && !contract.restitution_status && (
                                <button
                                    disabled={busy}
                                    onClick={handleRequestRestitution}
                                    className="w-full py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                                >
                                    Demander la restitution de caution
                                </button>
                            )}

                            {/* Traitement propriétaire */}
                            {isOwner && contract.restitution_status === 'restitution_requested' && (
                                <button
                                    onClick={() => setShowRestitution(true)}
                                    className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                                >
                                    Traiter la demande de restitution
                                </button>
                            )}

                            {/* Compléter restitution (propriétaire) */}
                            {isOwner && contract.restitution_status === 'restitution_processing' && (
                                <button
                                    disabled={busy}
                                    onClick={async () => {
                                        if (!window.confirm('Confirmer la restitution complétée ?')) return;
                                        setBusy(true);
                                        const res = await contractService.completeRestitution(contract.id);
                                        setBusy(false);
                                        if (res.ok) { toast.success('Restitution complétée !'); loadContract(); }
                                        else toast.error(res.data?.error || 'Erreur');
                                    }}
                                    className="w-full py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                                >
                                    Valider la restitution comme complétée
                                </button>
                            )}
                        </div>
                    </Section>
                )}

                {/* Hash intégrité */}
                <Section title="Intégrité du document" icon={Shield}>
                    <div className="text-xs font-mono text-gray-500 space-y-1">
                        <p><span className="text-gray-400">Hash document :</span> {contract.document_hash || '—'}</p>
                        {contract.signed_document_hash && (
                            <p><span className="text-gray-400">Hash signé :</span> {contract.signed_document_hash}</p>
                        )}
                    </div>
                </Section>

            </div>

            {/* ── Modals ── */}

            {/* Canvas signature */}
            {showSignCanvas && (
                <SignatureCanvas
                    onSave={handleSignSave}
                    onCancel={() => setShowSignCanvas(false)}
                />
            )}

            {/* Journal d'audit */}
            {showAudit && (
                <AuditLogModal contractId={contract.id} onClose={() => setShowAudit(false)} />
            )}

            {/* Modal paiement (propriétaire) */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Définir les montants</h3>
                        <form onSubmit={handleSetPayment} className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600">Loyer mensuel (XOF)</label>
                                <input type="number" min="0" required value={payForm.rent}
                                    onChange={e => setPayForm(p => ({ ...p, rent: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Caution mensuelle (XOF)</label>
                                <input type="number" min="0" required value={payForm.deposit}
                                    onChange={e => setPayForm(p => ({ ...p, deposit: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Nombre de mois de caution</label>
                                <select value={payForm.months}
                                    onChange={e => setPayForm(p => ({ ...p, months: parseInt(e.target.value) }))}
                                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    {[1,2,3].map(m => <option key={m} value={m}>{m} mois</option>)}
                                </select>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm">
                                Total à payer : <strong>{fmt((parseFloat(payForm.rent) || 0) + (parseFloat(payForm.deposit) || 0) * payForm.months)}</strong>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPayment(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                                    Annuler
                                </button>
                                <button type="submit" disabled={busy}
                                    className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                                    Confirmer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal restitution (propriétaire) */}
            {showRestitution && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Traiter la restitution</h3>
                        <form onSubmit={handleProcessRestitution} className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600">Décision</label>
                                <select value={restForm.decision}
                                    onChange={e => setRestForm(p => ({ ...p, decision: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    <option value="full">Restitution complète</option>
                                    <option value="partial">Restitution partielle</option>
                                    <option value="refused">Restitution refusée</option>
                                </select>
                            </div>
                            {restForm.decision === 'partial' && (
                                <div>
                                    <label className="text-sm text-gray-600">Montant retenu (XOF)</label>
                                    <input type="number" min="0" value={restForm.retained}
                                        onChange={e => setRestForm(p => ({ ...p, retained: e.target.value }))}
                                        className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-gray-600">Notes (optionnel)</label>
                                <textarea value={restForm.notes}
                                    onChange={e => setRestForm(p => ({ ...p, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowRestitution(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                                    Annuler
                                </button>
                                <button type="submit" disabled={busy}
                                    className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
