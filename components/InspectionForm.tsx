'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhotoUpload from './PhotoUpload';
import ItemPhotoUpload from './ItemPhotoUpload';
import VideoUpload from './VideoUpload';
import VoiceNotesButton from './VoiceNotesButton';
import dynamic from 'next/dynamic';
import EnhancedGPSLocation from './EnhancedGPSLocation';
import EmailModal from './EmailModal';
import Toast from './Toast';

// Lazy load heavy components
const BarcodeScanner = dynamic(() => import('./BarcodeScanner'), {
  ssr: false,
  loading: () => <div className="text-black">Loading scanner...</div>,
});

const SignaturePad = dynamic(() => import('./SignaturePad'), {
  ssr: false,
  loading: () => <div className="text-black">Loading signature pad...</div>,
});
import { Save, Send, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Check, User, Car, MapPin, ClipboardCheck, PenTool } from 'lucide-react';
import {
  formPanelClass,
  formStepHeaderClass,
  formStepBadgeClass,
  formStepTitleClass,
  formSaveBtnClass,
  formFieldClass,
  formProgressShellClass,
} from '@/components/admin/AdminUI';
import InspectionChecklistStep from '@/components/inspection/InspectionChecklistStep';
import { isCaptureSessionActive } from '@/lib/capture-session';

const inspectionSchema = z.object({
  inspectorName: z.string().min(1, 'Inspector name is required'),
  inspectorEmail: z.string().email('Valid email is required'),
  inspectionDate: z.string().min(1, 'Inspection date is required'),
  location: z.any().optional(),
  barcode: z.string().optional(),
  vehicleInfo: z.object({
    dealer: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    dealerStockNo: z.string().optional(),
    vin: z.string().optional(),
    engine: z.string().optional(),
    odometer: z.string().optional(),
    colour: z.string().optional(),
    complianceDate: z.string().optional(),
    buildDate: z.string().optional(),
    year: z.string().optional(),
    licensePlate: z.string().optional(),
  }).optional(),
  checklist: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      items: z.array(
        z.object({
          item: z.string().min(1, 'Item is required'),
          status: z.enum(['OK', 'C', 'A', 'R', 'RP', 'N']),
          notes: z.string().optional(),
          photos: z.array(z.object({
            fileName: z.string(),
            url: z.string().optional(),
            damageMarkers: z.array(z.object({
              id: z.string().optional(),
              x: z.number(),
              y: z.number(),
              label: z.string(),
            })).optional(),
            metadata: z.object({
              width: z.number().optional(),
              height: z.number().optional(),
              make: z.string().optional(),
              model: z.string().optional(),
              dateTime: z.string().optional(),
              latitude: z.number().optional(),
              longitude: z.number().optional(),
            }).optional().nullable(),
          })).optional(),
        })
      ),
    })
  ),
  photos: z.array(z.object({
    fileName: z.string(),
    metadata: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      dateTime: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional().nullable(),
  })),
  walkAroundVideos: z.array(z.object({
    fileName: z.string(),
    url: z.string().optional(),
    metadata: z.any().optional().nullable(),
  })).optional(),
  signatures: z.object({
    technician: z.string().optional(),
    manager: z.string().optional(),
  }).optional(),
  // Client terms are handled via ToS agreement; no inspector consent required in-form
  privacyConsent: z.boolean().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const defaultChecklist = [
  {
    category: 'Pre delivery Inspection',
    items: [
      { item: 'Check outstanding recalls/Reworks/SSP (record evidence)', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Confirm Owner\'s Manual + Warranty Booklet present', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Exterior',
    items: [
      { item: 'Torque all wheel nuts to spec', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Tyre pressures incl. spare', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Weather seals & glass condition', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Bonnet release & lock operation', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Tailgate, window glass, fuel lid operation', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Door operation & alignment', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Exterior lighting systems', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Headlight aiming', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Roof operation (if applicable)', status: 'N' as const, notes: '', photos: [] },
      { item: 'Remove tow hooks & fit blanking caps', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Install: Mud flaps / Wheel caps / Aerial (if required)', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Interior – Install/Set',
    items: [
      { item: 'Install fuses (if required)', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Audio/Navigation setup + presets + clock', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Set service reminder', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Bluetooth pairing check', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Navigation card/disk present', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Interior – Function Check',
    items: [
      { item: 'Audio operation + reception + CD test', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Seat controls + headrests + folding + warmers', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Door locks + child locks + keyless remotes', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Seatbelts + warnings + retractors', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Ignition + steering lock', status: 'OK' as const, notes: '', photos: [] },
      { item: 'All warning chimes', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Shift lock / starter interlock / inhibitor', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Interior lights + dash indicators', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Horn / wipers / washers', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Parking sensors + camera', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Windows (manual/power + auto return)', status: 'OK' as const, notes: '', photos: [] },
      { item: 'HVAC (heat/cool/all modes)', status: 'OK' as const, notes: '', photos: [] },
      { item: 'All keys start engine & operate locks', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Remote boot release', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Mirrors (power/auto-dim/day-night)', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Sun-visors + mirrors + lights', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Compartment doors & lids', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Sunroof operation', status: 'N' as const, notes: '', photos: [] },
      { item: 'Tilt/telescopic steering', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Cigarette lighter/12V/USB power', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Transfer case & hub function (if applicable)', status: 'N' as const, notes: '', photos: [] },
      { item: 'Upholstery & interior finish', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Park brake operation & adjustment', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Tool kit / jack / accessories', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Under Vehicle',
    items: [
      { item: 'Fuel/coolant/hydraulic lines for leaks', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Remove production coolant clip buckles', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Steering/suspension/exhaust tightness', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Differential oil level', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Transmission oil level', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Transfer case/PTO level', status: 'N' as const, notes: '', photos: [] },
      { item: 'Tyres for cuts/damage/matching spec', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Under Bonnet',
    items: [
      { item: 'Check lines, fittings & components for leaks', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Wiring harness security', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Engine oil level', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Brake & clutch fluid level', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Washer reservoir fluid', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Coolant level + pressure test', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Power steering fluid', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Drive belt tension', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Build/compliance plates + labels', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Battery terminals tight + performance test', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Auto transmission fluid level', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Fill AdBlue (Diesel CX-7 only)', status: 'N' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Final QC',
    items: [
      { item: 'Owner information materials verified', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Battery final check', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Remove protective covers/labels', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Reset trip meter/computer', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Affix 1,000 km service sticker', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Check dealer-fitted accessories', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Final Appearance',
    items: [
      { item: 'Transit damage check', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Manufacturing damage check', status: 'OK' as const, notes: '', photos: [] },
      { item: 'Fallout/environmental damage check', status: 'OK' as const, notes: '', photos: [] },
    ],
  },
];

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Normalize date to yyyy-MM-dd for <input type="date"> (avoids "does not conform" warning with ISO strings). */
function toDateOnly(val: string | Date | undefined | null): string {
  if (val == null || val === '') return getTodayDateString();
  const d = typeof val === 'string' ? new Date(val) : val;
  if (Number.isNaN(d.getTime())) return getTodayDateString();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface InspectionFormProps {
  inspectionId?: string;
  initialData?: any;
  readOnly?: boolean;
}

export default function InspectionForm({ inspectionId, initialData, readOnly = false }: InspectionFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepInitialized, setStepInitialized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sectionSaving, setSectionSaving] = useState<{ [key: string]: boolean }>({});
  const [sectionSaved, setSectionSaved] = useState<{ [key: string]: boolean }>({});
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [barcodeType, setBarcodeType] = useState<'VIN' | 'COMPLIANCE' | 'OTHER'>('OTHER');
  const [location, setLocation] = useState(initialData?.location || {
    current: undefined,
    start: undefined,
  });
  const [photos, setPhotos] = useState<Array<{ fileName: string; metadata?: any }>>(
    initialData?.photos?.map((p: any) => typeof p === 'string' ? { fileName: p } : p) || []
  );
  const [walkAroundVideos, setWalkAroundVideos] = useState<
    Array<{ fileName: string; url?: string; metadata?: Record<string, unknown> | null }>
  >(
    Array.isArray((initialData as any)?.walkAroundVideos)
      ? (initialData as any).walkAroundVideos.map((v: any) =>
          typeof v === 'string' ? { fileName: v } : v
        )
      : []
  );
  const [signatures, setSignatures] = useState({
    technician: initialData?.signatures?.technician || '',
    manager: initialData?.signatures?.manager || '',
  });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [activeChecklistCategory, setActiveChecklistCategory] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [draftId, setDraftId] = useState<string | null>(inspectionId || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialData?.status === 'completed');
  const completingRef = useRef(false);

  useEffect(() => {
    if (initialData?.status === 'completed') {
      setIsCompleted(true);
    }
  }, [initialData?.status]);

  type StepKey = 'inspector' | 'vehicle' | 'gps' | 'checklist' | 'signatures';
  const stepKeyOrder: StepKey[] = ['inspector', 'vehicle', 'gps', 'checklist', 'signatures'];
  const stepDefs: Record<StepKey, { title: string; shortTitle?: string; icon: typeof User }> = {
    inspector: { title: 'Inspector Info', icon: User },
    vehicle: { title: 'Vehicle & Identification', shortTitle: 'Vehicle', icon: Car },
    gps: { title: 'GPS & Photos', shortTitle: 'GPS', icon: MapPin },
    checklist: { title: 'Checklist', icon: ClipboardCheck },
    signatures: { title: 'Signatures', icon: PenTool },
  };
  const steps = stepKeyOrder.map((k, i) => ({ number: i + 1, ...stepDefs[k] }));
  const totalSteps = steps.length;
  const getStepKey = (n: number): StepKey | undefined => stepKeyOrder[n - 1];
  const checklistStepNumber = stepKeyOrder.indexOf('checklist') + 1;
  const signaturesStepNumber = stepKeyOrder.indexOf('signatures') + 1;

  // Restore step from URL on mount (so refresh keeps you on the same step)
  useEffect(() => {
    if (stepInitialized) return;
    const stepParam = searchParams.get('step');
    const step = parseInt(stepParam || '1', 10);
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
    setStepInitialized(true);
  }, [searchParams, totalSteps, stepInitialized]);

  const goToStep = useCallback((step: number) => {
    const safeStep = Math.max(1, Math.min(step, totalSteps));
    setCurrentStep(safeStep);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(safeStep));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, totalSteps, searchParams]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          inspectionDate: toDateOnly(initialData.inspectionDate),
          walkAroundVideos: Array.isArray((initialData as any).walkAroundVideos)
            ? (initialData as any).walkAroundVideos
            : [],
        }
      : {
          inspectorName: '',
          inspectorEmail: '',
          inspectionDate: getTodayDateString(),
          checklist: defaultChecklist,
          photos: [],
          walkAroundVideos: [],
          privacyConsent: true,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklist',
  });

  const activeCategoryTitle = watch(
    `checklist.${Math.min(activeChecklistCategory, Math.max(0, fields.length - 1))}.category` as `checklist.${number}.category`
  );

  const overallProgressPercent = useMemo(() => {
    const catCount = Math.max(1, fields.length);
    if (currentStep === signaturesStepNumber) return 100;
    if (currentStep < checklistStepNumber) return Math.round((currentStep / totalSteps) * 100);
    const base = ((checklistStepNumber - 1) / totalSteps) * 100;
    const span = (1 / totalSteps) * 100;
    return Math.min(99, Math.round(base + ((activeChecklistCategory + 1) / catCount) * span));
  }, [currentStep, totalSteps, fields.length, activeChecklistCategory, checklistStepNumber, signaturesStepNumber]);

  useEffect(() => {
    if (currentStep !== checklistStepNumber) {
      setActiveChecklistCategory(0);
      return;
    }
    const maxIdx = Math.max(0, fields.length - 1);
    setActiveChecklistCategory((i) => Math.min(i, maxIdx));
  }, [currentStep, fields.length, checklistStepNumber]);

  // Sync inspection date from initialData to yyyy-MM-dd so the date input displays correctly in view mode
  useEffect(() => {
    if (initialData?.inspectionDate != null) {
      setValue('inspectionDate', toDateOnly(initialData.inspectionDate));
    }
  }, [initialData?.inspectionDate, setValue]);

  // Auto-fetch inspector email/name from logged-in user when starting a new inspection (no draft auto-load)
  useEffect(() => {
    if (readOnly || initialData || inspectionId) return;

    const fetchUser = async () => {
      try {
        const userResponse = await fetch('/api/auth/me', { credentials: 'include' });
        const userData = await userResponse.json();
        if (userData.success && userData.user) {
          if (userData.user.email) {
            setValue('inspectorEmail', userData.user.email);
          }
          if (userData.user.name) {
            setValue('inspectorName', userData.user.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [readOnly, initialData, inspectionId, setValue]);

  // Check authentication periodically and on visibility change
  useEffect(() => {
    if (readOnly) return; // Skip auth check for read-only mode
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        if (data.success && data.user) {
          setIsAuthenticated(true);
          // Update inspector email if user email changed
          if (!initialData?.inspectorEmail && data.user.email) {
            setValue('inspectorEmail', data.user.email);
          }
        } else {
          setIsAuthenticated(false);
          setToast({
            message: 'Your session has expired. Please login again to continue',
            type: 'error'
          });
        }
      } catch (error) {
        setIsAuthenticated(false);
        setToast({
          message: 'Please login to continue',
          type: 'error'
        });
      }
    };
    
    // Initial check
    checkAuth();
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    // Periodic check (every 30 seconds)
    const authInterval = setInterval(() => {
      checkAuth();
    }, 30000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(authInterval);
    };
  }, [readOnly, initialData, setValue]);

  useEffect(() => {
    if (barcode) {
      setValue('barcode', barcode);
      if (barcodeType === 'VIN') {
        setValue('vehicleInfo.vin', barcode);
      }
    }
  }, [barcode, barcodeType, setValue]);

  useEffect(() => {
    if (location) {
      setValue('location', location);
    }
  }, [location, setValue]);

  useEffect(() => {
    setValue('photos', photos);
  }, [photos, setValue]);

  useEffect(() => {
    setValue('walkAroundVideos', walkAroundVideos);
  }, [walkAroundVideos, setValue]);

  // Auto-save draft function
  const saveDraft = useCallback(async (silent = true) => {
    if (readOnly || isSavingDraft || completingRef.current || isCaptureSessionActive()) return;
    
    const values = getValues();
    
    // Don't save empty drafts
    if (!values.inspectorName && !values.inspectorEmail && !values.inspectionDate) {
      return;
    }
    
    setIsSavingDraft(true);
    
    try {
      const draftData: Record<string, unknown> = {
        inspectorName: values.inspectorName || '',
        inspectorEmail: values.inspectorEmail || '',
        inspectionDate: values.inspectionDate || getTodayDateString(),
        vehicleInfo: values.vehicleInfo || {},
        checklist: values.checklist || defaultChecklist,
        location: location.start || location.current ? location : {},
        barcode: barcode || undefined,
        photos: photos || [],
        walkAroundVideos: walkAroundVideos || [],
        signatures: signatures.technician ? { technician: signatures.technician } : undefined,
        status: (isCompleted ? 'completed' : 'draft') as 'draft' | 'completed',
        privacyConsent: true,
        inspectionType: 'pdi',
      };
      
      let savedDraftId = draftId;
      
      if (!savedDraftId) {
        // Create new draft
        const response = await fetch('/api/inspections', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });
        
        const result = await response.json();
        
        if (result.success && result.data?._id) {
          savedDraftId = result.data._id;
          setDraftId(savedDraftId);

          // Only navigate on explicit save — silent autosave must not remount the page mid-camera.
          if (!silent && !inspectionId && pathname?.startsWith('/inspection/new')) {
            router.replace(
              `/inspections/${savedDraftId}?edit=1&step=${currentStep}`,
              { scroll: false }
            );
          }
          
          if (!silent) {
            setToast({
              message: 'Draft saved successfully',
              type: 'success'
            });
          }
        } else {
          throw new Error(result.error || 'Failed to create draft');
        }
      } else {
        // Update existing draft
        const response = await fetch(`/api/inspections/${savedDraftId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update draft');
        }
        
        if (!silent) {
          setToast({
            message: 'Draft saved successfully',
            type: 'success'
          });
        }
      }
      
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Auto-save draft error:', error);
      // Don't show error toast for silent saves to avoid annoying the user
      if (!silent) {
        setToast({
          message: `Failed to save draft: ${error.message}`,
          type: 'error'
        });
      }
    } finally {
      setIsSavingDraft(false);
    }
  }, [readOnly, isSavingDraft, isCompleted, getValues, location, barcode, photos, walkAroundVideos, signatures, draftId, inspectionId, setDraftId, setToast, currentStep, pathname, router]);

  // Auto-save draft periodically and when data changes
  useEffect(() => {
    if (readOnly || !isAuthenticated) return; // Skip if read-only or not authenticated
    
    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      saveDraft(true); // Silent save
    }, 30000); // 30 seconds
    
    // Auto-save when page becomes hidden (user switches tabs/windows)
    const handleBeforeUnload = () => {
      saveDraft(true); // Silent save on page unload
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isCaptureSessionActive()) {
        saveDraft(true); // Silent save when tab becomes hidden (not during camera)
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [readOnly, isAuthenticated, saveDraft]);
  
  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (readOnly || !isAuthenticated) return;
    
    const debounceTimer = setTimeout(() => {
      if (isCaptureSessionActive()) return;
      const values = getValues();
      // Only save if there's actual data entered
      if (values.inspectorName || values.inspectorEmail || values.inspectionDate || barcode || photos.length > 0 || walkAroundVideos.length > 0) {
        saveDraft(true); // Silent save
      }
    }, 5000); // Debounce for 5 seconds after last change
    
    return () => clearTimeout(debounceTimer);
  }, [readOnly, isAuthenticated, getValues, barcode, photos, walkAroundVideos, location, saveDraft]);

  // Helper function to save a specific section
  const saveSection = async (sectionName: string, sectionData: any) => {
    if (!inspectionId && !draftId) {
      alert('Cannot save section: Inspection ID is required');
      return;
    }

    const idToUse = inspectionId || draftId;
    if (!idToUse) return;

    setSectionSaving(prev => ({ ...prev, [sectionName]: true }));
    setSectionSaved(prev => ({ ...prev, [sectionName]: false }));

    try {
      // Get current inspection data
      const currentResponse = await fetch(`/api/inspections/${idToUse}`, { credentials: 'include' });
      const currentResult = await currentResponse.json();
      
      if (!currentResult.success) {
        throw new Error('Failed to fetch current inspection data');
      }

      const currentData = currentResult.data;
      
      // Merge section data with current data
      const updatedData = {
        ...currentData,
        ...sectionData,
        status: currentData.status === 'completed' ? 'completed' : currentData.status ?? 'draft',
      };

      const response = await fetch(`/api/inspections/${idToUse}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        setSectionSaved(prev => ({ ...prev, [sectionName]: true }));
        setTimeout(() => {
          setSectionSaved(prev => ({ ...prev, [sectionName]: false }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to save section');
      }
    } catch (error: any) {
      alert(`Error saving ${sectionName}: ${error.message}`);
      console.error(`Section save error (${sectionName}):`, error);
    } finally {
      setSectionSaving(prev => ({ ...prev, [sectionName]: false }));
    }
  };

  // Save Inspector Information section
  const saveInspectorInfo = async () => {
    const values = getValues();
    const formData: Record<string, unknown> = {
      inspectorName: values.inspectorName,
      inspectorEmail: values.inspectorEmail,
      inspectionDate: values.inspectionDate,
      inspectionType: 'pdi',
    };
    await saveSection('inspectorInfo', formData);
  };

  // Save Vehicle Information section
  const saveVehicleInfo = async () => {
    const values = getValues();
    const formData = {
      vehicleInfo: values.vehicleInfo || {},
    };
    await saveSection('vehicleInfo', formData);
  };

  // Save GPS Location section
  const saveGPSLocation = async () => {
    await saveSection('location', { location });
  };

  // Save Barcode section
  const saveBarcode = async () => {
    await saveSection('barcode', { barcode });
  };

  // Save Photos section
  const savePhotos = async () => {
    await saveSection('photos', { photos, walkAroundVideos });
  };

  // Save Checklist section
  const saveChecklist = async () => {
    const values = getValues();
    const formValues = {
      checklist: values.checklist || [],
    };
    await saveSection('checklist', formValues);
  };

  // Save Signatures section
  const saveSignatures = async () => {
    await saveSection('signatures', { signatures });
  };

  // Validate all steps before submission
  const validateAllSteps = (): { valid: boolean; error?: string; step?: number } => {
    for (let step = 1; step <= totalSteps; step++) {
      const validation = validateStep(step);
      if (!validation.valid) {
        return { valid: false, error: validation.error, step };
      }
    }
    return { valid: true };
  };

  // Overall save function
  const onSubmit = async (data: InspectionFormData) => {
    // Check authentication first
    try {
      const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
      const authData = await authResponse.json();
      if (!authData.success || !authData.user) {
        setToast({
          message: 'Please login first to submit an inspection',
          type: 'error'
        });
        return;
      }
    } catch (error) {
      setToast({
        message: 'Please login first to submit an inspection',
        type: 'error'
      });
      return;
    }

    // Validate all steps before submission
    const allStepsValidation = validateAllSteps();
    if (!allStepsValidation.valid) {
      setToast({
        message: allStepsValidation.error || 'Please complete all required fields',
        type: 'error'
      });
      // Navigate to the step with error
      if (allStepsValidation.step) {
        goToStep(allStepsValidation.step);
      }
      return;
    }

    // Use draftId if exists, otherwise use inspectionId
    const idToUse = draftId || inspectionId;

    // Block auto-save from reverting status to draft while completing
    completingRef.current = true;
    setIsCompleted(true);
    
    if (!idToUse) {
      // For completely new inspections, create new
      setSubmitting(true);
      setSuccess(false);

      try {
        // Prepare location data - use the location state directly
        const locationData = location.start || location.current 
          ? location 
          : (location.latitude ? {
              current: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
              },
            } : {});

        const inspectionData = {
          ...data,
          inspectionDate: new Date(data.inspectionDate),
          location: locationData,
          barcode: barcode || undefined,
          photos: photos || [],
          walkAroundVideos: walkAroundVideos || [],
          signatures: signatures.technician ? { technician: signatures.technician } : undefined,
          status: 'completed' as const, // Set to completed when user submits
        };

        const response = await fetch('/api/inspections', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspectionData),
        });

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
          setSuccess(true);
          setDraftId(result.data._id); // Set draftId in case user needs to continue
          setIsCompleted(true);
          setToast({
            message: 'Inspection completed successfully!',
            type: 'success'
          });
          setTimeout(() => {
            router.push(`/inspections/${result.data._id}`);
          }, 1500);
        } else {
          setIsCompleted(initialData?.status === 'completed');
          completingRef.current = false;
          const errorMessage = result.error || 'Failed to create inspection. Please try again.';
          setToast({
            message: errorMessage,
            type: 'error'
          });
          console.error('Form submission error:', result);
        }
      } catch (error: any) {
        setIsCompleted(initialData?.status === 'completed');
        completingRef.current = false;
        const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
        setToast({
          message: errorMessage,
          type: 'error'
        });
        console.error('Form submission error:', error);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // For existing inspections/drafts, update and mark as completed
    setSubmitting(true);
    setSuccess(false);

    try {
      const inspectionData = {
        ...data,
        inspectionNumber: initialData?.inspectionNumber,
        inspectionDate: new Date(data.inspectionDate),
        location: location.start || location.current 
          ? location 
          : (location.latitude ? {
              current: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
              },
            } : {}),
        barcode: barcode || undefined,
        photos: photos || [],
        walkAroundVideos: walkAroundVideos || [],
        signatures: signatures.technician ? { technician: signatures.technician } : undefined,
        status: 'completed' as const, // Mark as completed when user submits
      };

      const response = await fetch(`/api/inspections/${idToUse}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setIsCompleted(true);
        setToast({
          message: 'Inspection completed successfully!',
          type: 'success'
        });
        setTimeout(() => {
          router.push(`/inspections/${idToUse}`);
        }, 1500);
      } else {
        setIsCompleted(initialData?.status === 'completed');
        completingRef.current = false;
        setToast({
          message: result.error || 'Failed to save inspection',
          type: 'error'
        });
      }
    } catch (error: any) {
      setIsCompleted(initialData?.status === 'completed');
      completingRef.current = false;
      setToast({
        message: error.message || 'An unexpected error occurred',
        type: 'error'
      });
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSend = async (emailList: string[]) => {
    if (!inspectionId) {
      throw new Error('Inspection ID is required');
    }

    const response = await fetch(`/api/inspections/${inspectionId}/email`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        recipients: emailList 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || `Failed to send email. Status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
  };

  // Step validation
  const validateStep = (step: number): { valid: boolean; error?: string } => {
    const values = getValues();
    const key = getStepKey(step);
    switch (key) {
      case 'inspector':
        if (!values.inspectorName || values.inspectorName.trim() === '') {
          return { valid: false, error: 'Inspector name is required' };
        }
        if (!values.inspectorEmail || values.inspectorEmail.trim() === '') {
          return { valid: false, error: 'Inspector email is required' };
        }
        if (values.inspectorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.inspectorEmail.trim())) {
          return { valid: false, error: 'Please enter a valid email address' };
        }
        if (!values.inspectionDate) {
          return { valid: false, error: 'Inspection date is required' };
        }
        return { valid: true };
      case 'vehicle':
        // Vehicle info validation - at least VIN or License Plate should be provided
        const vehicleInfo = values.vehicleInfo || {};
        if (!vehicleInfo.vin && !vehicleInfo.licensePlate) {
          return { valid: false, error: 'Please provide at least VIN or License Plate' };
        }
        return { valid: true };
      case 'gps':
        // GPS required; general photos optional (repair items carry photos on checklist)
        if (!location || (!location.current && !location.start)) {
          return { valid: false, error: 'Please capture GPS location before proceeding' };
        }
        return { valid: true };
      case 'checklist':
        // Checklist validation
        const checklist = values.checklist || [];
        if (!checklist || checklist.length === 0) {
          return { valid: false, error: 'Please add at least one checklist category' };
        }
        
        for (let i = 0; i < checklist.length; i++) {
          const category = checklist[i];
          if (!category.category || category.category.trim() === '') {
            return { valid: false, error: `Category ${i + 1} name is required` };
          }
          
          if (!category.items || category.items.length === 0) {
            return { valid: false, error: `Category "${category.category}" must have at least one item` };
          }
          
          for (let j = 0; j < category.items.length; j++) {
            const item = category.items[j];
            if (!item.item || item.item.trim() === '') {
              return { valid: false, error: `Item name is required in category "${category.category}"` };
            }
            if (!item.status) {
              return { valid: false, error: `Item status is required for "${item.item}" in category "${category.category}"` };
            }
            // Photos only required for repair-related items (fraud prevention + faster flow)
            const needsRepairPhoto = item.status === 'R' || item.status === 'RP';
            if (needsRepairPhoto) {
              const itemPhotos = item.photos ?? [];
              if (!itemPhotos.length) {
                return { valid: false, error: `Please add at least one photo for "${item.item}" in category "${category.category}"` };
              }
            }
          }
        }
        return { valid: true };
      case 'signatures':
        // Signatures (client terms handled via ToS)
        if (!signatures.technician) {
          return { valid: false, error: 'Technician signature is required' };
        }
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const handleNext = async () => {
    // Check authentication before proceeding
    try {
      const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
      const authData = await authResponse.json();
      if (!authData.success || !authData.user) {
        setToast({
          message: 'Please login first to continue',
          type: 'error'
        });
        return;
      }
    } catch (error) {
      setToast({
        message: 'Please login first to continue',
        type: 'error'
      });
      return;
    }

    const validation = validateStep(currentStep);
    if (validation.valid) {
      goToStep(Math.min(currentStep + 1, totalSteps));
    } else {
      // Show fancy error alert
      setToast({
        message: validation.error || 'Please fix the errors before proceeding',
        type: 'error'
      });
      // Also trigger form validation to show field errors
      handleSubmit(() => {})().catch(() => {});
    }
  };

  const handlePrevious = () => {
    goToStep(Math.max(currentStep - 1, 1));
  };

  /** Footer Previous: on checklist step, go to previous category before leaving the step. */
  const handleFooterPrevious = () => {
    if (currentStep === checklistStepNumber && fields.length > 0 && activeChecklistCategory > 0) {
      setActiveChecklistCategory((i) => Math.max(0, i - 1));
      return;
    }
    handlePrevious();
  };

  /** Footer Next: on checklist step, advance section until the last, then proceed to signatures. */
  const handleFooterNext = async () => {
    if (currentStep === checklistStepNumber && fields.length > 0) {
      const lastIdx = fields.length - 1;
      const safeIdx = Math.max(0, Math.min(activeChecklistCategory, lastIdx));
      if (safeIdx < lastIdx) {
        setActiveChecklistCategory((i) => Math.min(lastIdx, i + 1));
        return;
      }
    }
    await handleNext();
  };

  const renderStepContent = () => {
    const key = getStepKey(currentStep);
    switch (key) {
      case 'inspector':
        return renderStep1();
      case 'vehicle':
        return renderStep2();
      case 'gps':
        return renderStep3();
      case 'checklist':
        return renderStep4();
      case 'signatures':
        return renderStep6();
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <div className={`${formPanelClass} space-y-4`}>
      <div className={formStepHeaderClass}>
        <div className="flex items-center flex-1 min-w-0">
          <div className={formStepBadgeClass}>
            <span className="text-white font-bold text-lg">1</span>
          </div>
          <h2 className={formStepTitleClass}>Inspector Information</h2>
        </div>
        {!readOnly && inspectionId && (
          <button
            type="button"
            onClick={saveInspectorInfo}
            disabled={sectionSaving.inspectorInfo}
            className={formSaveBtnClass}
          >
            {sectionSaving.inspectorInfo ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : sectionSaved.inspectorInfo ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1.5">
            Inspector Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register('inspectorName')}
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          {errors.inspectorName && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.inspectorName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1.5">
            Inspector Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            {...register('inspectorEmail')}
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          {errors.inspectorEmail && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.inspectorEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1.5">
            Inspection Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            {...register('inspectionDate')}
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          {errors.inspectionDate && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.inspectionDate.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <div className={`${formPanelClass} max-w-full ${readOnly ? '' : 'mb-4'}`}>
        <div className={`${formStepHeaderClass} mb-0 border-b-0 py-0`}>
          <h3 className={`${formStepTitleClass} text-base`}>Vehicle Identification Scan</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveBarcode}
              disabled={sectionSaving.barcode}
              className={formSaveBtnClass}
            >
              {sectionSaving.barcode ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : sectionSaved.barcode ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
        <BarcodeScanner
          onScan={(payload) => {
            if (readOnly) return;
            const primary = payload.vin || payload.raw;
            setBarcode(primary);
            setBarcodeType(payload.type);
            if (payload.vin) setValue('vehicleInfo.vin', payload.vin);
            if (payload.make) setValue('vehicleInfo.make', payload.make);
            if (payload.model) setValue('vehicleInfo.model', payload.model);
            if (payload.engine) setValue('vehicleInfo.engine', payload.engine);
            setToast({
              message: [
                payload.vin && `VIN ${payload.vin}`,
                payload.make,
                payload.model && `Model ${payload.model}`,
              ]
                .filter(Boolean)
                .join(' · ') || 'Vehicle ID captured',
              type: 'success',
            });
          }}
          value={barcode}
          scanType="ANY"
          readOnly={readOnly}
        />
      </div>

      <div className={`${formPanelClass} space-y-4 ${readOnly ? 'mt-6' : ''}`}>
        <div className={formStepHeaderClass}>
          <div className="flex items-center flex-1 min-w-0">
            <div className={formStepBadgeClass}>
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h2 className={formStepTitleClass}>Vehicle Information</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveVehicleInfo}
              disabled={sectionSaving.vehicleInfo}
              className={formSaveBtnClass}
            >
              {sectionSaving.vehicleInfo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : sectionSaved.vehicleInfo ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            {...register('vehicleInfo.dealer')}
            placeholder="Dealer"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.make')}
            placeholder="Make"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.model')}
            placeholder="Model"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.dealerStockNo')}
            placeholder="Dealer Stock No"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.vin')}
            placeholder="VIN"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.engine')}
            placeholder="Engine"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.odometer')}
            placeholder="Odometer"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <input
            {...register('vehicleInfo.colour')}
            placeholder="Colour"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
          <div>
            <label className="block text-xs text-black mb-1">Compliance Date</label>
            <input
              {...register('vehicleInfo.complianceDate')}
              type="date"
              disabled={readOnly}
              className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
            />
          </div>
          <div>
            <label className="block text-xs text-black mb-1">Build Date</label>
            <input
              {...register('vehicleInfo.buildDate')}
              type="date"
              disabled={readOnly}
              className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
            />
          </div>
          <input
            {...register('vehicleInfo.licensePlate')}
            placeholder="License Plate"
            disabled={readOnly}
            className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
          />
        </div>
        <div>
          {/* Booking number removed */}
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className={`${formPanelClass} ${readOnly ? '' : 'mb-4'}`}>
        <div className={`${formStepHeaderClass} mb-0 border-b-0 py-0`}>
          <h3 className={`${formStepTitleClass} text-base`}>GPS Location</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveGPSLocation}
              disabled={sectionSaving.location}
              className={formSaveBtnClass}
            >
              {sectionSaving.location ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : sectionSaved.location ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
        <EnhancedGPSLocation onLocationChange={setLocation} value={location} readOnly={readOnly} />
      </div>

      <div className={`${formPanelClass} ${readOnly ? 'mt-6' : ''}`}>
        <div className={`${formStepHeaderClass} mb-0 border-b-0 py-0`}>
          <h3 className={`${formStepTitleClass} text-base`}>General Photos</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={savePhotos}
              disabled={sectionSaving.photos}
              className={formSaveBtnClass}
            >
              {sectionSaving.photos ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : sectionSaved.photos ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-black">General photos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['front', 'rear', 'bonnet', 'left', 'right', 'tyres'] as const).map((slot) => {
              const slotLabel =
                slot === 'front'
                  ? 'Photo – front of vehicle'
                  : slot === 'rear'
                    ? 'Photo – rear of vehicle'
                    : slot === 'bonnet'
                      ? 'Photo – bonnet / hood'
                      : slot === 'left'
                        ? 'Photo – left side of vehicle'
                        : slot === 'right'
                          ? 'Photo – right side of vehicle'
                          : 'Photo – tyres / wheels';

              const slotPhotos = (photos as any[])
                .map((p: any) => (typeof p === 'string' ? { fileName: p } : p))
                .filter((p: any) => (p?.metadata as any)?.slot === slot);

              const otherPhotos = (photos as any[])
                .map((p: any) => (typeof p === 'string' ? { fileName: p } : p))
                .filter((p: any) => (p?.metadata as any)?.slot !== slot);

              return (
                <div key={slot} className="rounded-xl border border-gray-200 p-3 bg-white">
                  <PhotoUpload
                    photos={slotPhotos}
                    onPhotosChange={(nextSlotPhotos) => {
                      // keep only 1 (latest) for each guided slot
                      const one = nextSlotPhotos.slice(-1).map((p: any) => ({
                        ...p,
                        metadata: { ...(p.metadata || {}), slot },
                      }));
                      setPhotos([...otherPhotos, ...one]);
                    }}
                    readOnly={readOnly}
                    label={slotLabel}
                    buttonLabel="Take photo"
                    maxPhotos={1}
                    uploadTag={{ slot }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600">
            General photos are not required to continue-repair items use photos on the checklist.
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-black mb-2">Walk-around video (optional)</h4>
          <div className="text-black">
            <VideoUpload videos={walkAroundVideos} onVideosChange={setWalkAroundVideos} readOnly={readOnly} />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep4 = () => {
    const vehicleInfo = watch('vehicleInfo') || {};
    const vinLabel =
      (vehicleInfo.vin as string | undefined) ||
      (barcodeType === 'VIN' ? barcode : '') ||
      barcode ||
      '';
    const vehicleTitle =
      [vehicleInfo.year, vehicleInfo.make, vehicleInfo.model].filter(Boolean).join(' ') ||
      'Vehicle details';

    return (
      <InspectionChecklistStep
        fields={fields}
        activeCategoryIndex={activeChecklistCategory}
        onCategoryChange={setActiveChecklistCategory}
        register={register}
        watch={watch}
        setValue={setValue}
        getValues={getValues}
        readOnly={readOnly}
        inspectionId={inspectionId}
        onSaveSection={saveChecklist}
        sectionSaving={sectionSaving.checklist}
        sectionSaved={sectionSaved.checklist}
        vehicleTitle={vehicleTitle}
        vinLabel={vinLabel}
      />
    );
  };

  const renderStep6 = () => (
    <>
      <div className={`${formPanelClass} ${readOnly ? '' : 'mb-4'}`}>
        <div className={formStepHeaderClass}>
          <div className="flex items-center flex-1 min-w-0">
            <div className={formStepBadgeClass}>
              <span className="text-white font-bold text-lg">{signaturesStepNumber}</span>
            </div>
            <h2 className={formStepTitleClass}>Signatures</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveSignatures}
              disabled={sectionSaving.signatures}
              className={formSaveBtnClass}
            >
              {sectionSaving.signatures ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : sectionSaved.signatures ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
        
        <div>
          <SignaturePad
            onSave={(signature) => {
              if (!readOnly) {
                setSignatures({ ...signatures, technician: signature });
                setValue('signatures.technician', signature);
              }
            }}
            label="Technician Signature"
            value={signatures.technician}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Consent removed – handled via Terms of Service agreement */}
    </>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); }} className="app-surface w-full max-w-7xl mx-auto space-y-4 px-3 sm:px-4 min-w-0 max-w-full pb-8">
      {!readOnly && (
        <div className={formProgressShellClass}>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs text-white">
            <span className="font-semibold text-white">
              Step {currentStep} of {totalSteps}
              <span className="text-white/85 font-normal"> - {steps[currentStep - 1]?.title}</span>
            </span>
            {currentStep === checklistStepNumber && fields.length > 0 && (
              <span className="text-[#7eb8ff] font-medium truncate max-w-[min(100%,14rem)] sm:max-w-[20rem]" title={String(activeCategoryTitle || '')}>
                Checklist {activeChecklistCategory + 1}/{fields.length}
                {activeCategoryTitle ? `: ${activeCategoryTitle}` : ''}
              </span>
            )}
            <span className="text-white tabular-nums font-medium">{overallProgressPercent}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0033FF] transition-[width] duration-300 ease-out"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
          <div className="flex gap-1 sm:gap-1.5 mt-2 overflow-x-auto pb-0.5 min-w-0 -mx-0.5 px-0.5">
            {steps.map((s) => {
              const Icon = s.icon;
              const short = 'shortTitle' in s && s.shortTitle ? s.shortTitle : null;
              return (
                <span
                  key={s.number}
                  className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border max-w-[42vw] sm:max-w-none ${
                    currentStep === s.number
                      ? 'bg-[#0033FF] text-white border-[#0033FF] shadow-sm'
                      : 'bg-white/10 text-white/75 border-white/20'
                  }`}
                >
                  <Icon className="w-3 h-3 opacity-90 shrink-0" aria-hidden />
                  {short ? (
                    <>
                      <span className="truncate sm:hidden">{short}</span>
                      <span className="hidden sm:inline truncate">{s.title}</span>
                    </>
                  ) : (
                    <span className="truncate">{s.title}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/50 border-2 border-green-500/50 rounded-xl flex items-center animate-fade-in shadow-lg bg-slate-800/95">
          <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
          <span className="text-green-300 font-semibold">Inspection saved successfully!</span>
        </div>
      )}

      {/* Content - Step-by-step for new/editing, all at once for viewing */}
      <div className="flex flex-col min-w-0">
        <div className={`w-full min-w-0 ${readOnly ? 'space-y-6' : ''}`}>
          {readOnly ? (
            // View mode: Show all sections at once. Blue/Pink slip skip the
            // PDI-only vehicle and GPS sections - they don't apply.
            <>
              {renderStep1()}
              {renderStep2()}
              {renderStep3()}
              {renderStep4()}
              {renderStep6()}
            </>
          ) : (
            // Edit/Create mode: Show step-by-step
            renderStepContent()
          )}
        </div>
      </div>

      {/* Navigation Buttons - Only show for new/editing inspections (overflow-hidden prevents scrollbar on button hover) */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={handleFooterPrevious}
            disabled={currentStep === 1}
            className={`flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold transition-all w-full sm:w-auto ${currentStep === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Previous
          </button>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end overflow-hidden">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleFooterNext}
                className={`flex items-center justify-center rounded-xl font-semibold bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-md shadow-[#0033FF]/20 hover:brightness-105 transition-all w-full sm:w-auto ${
                  currentStep === checklistStepNumber
                    ? 'px-5 py-3.5 text-sm uppercase tracking-wide'
                    : 'px-4 py-2 text-sm'
                }`}
              >
                {currentStep === checklistStepNumber ? 'Continue' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {inspectionId ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit(onSubmit)()}
                    disabled={submitting}
                    className="flex items-center justify-center px-4 py-2 text-sm rounded-xl font-bold bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-lg shadow-[#0033FF]/25 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1.5"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Submit Report
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      const result = await handleSubmit(
                        (data) => {
                          onSubmit(data);
                        },
                        (errors) => {
                          const firstError = Object.values(errors)[0] as any;
                          setToast({
                            message: firstError?.message || 'Please check all required fields',
                            type: 'error'
                          });
                        }
                      )();
                    }}
                    disabled={submitting}
                    className="flex items-center justify-center px-4 py-2 text-sm rounded-xl font-bold bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-lg shadow-[#0033FF]/25 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                )}
                {inspectionId && (
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold shadow-lg shadow-pink-500/50 hover:from-pink-500 hover:to-rose-500 transition-all w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Email Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={handleEmailSend}
        inspectionNumber={initialData?.inspectionNumber}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
}


