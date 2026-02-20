'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhotoUpload from './PhotoUpload';
import ItemPhotoUpload from './ItemPhotoUpload';
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
import { Save, Send, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Check, User, Car, MapPin, ClipboardCheck, FileText, PenTool } from 'lucide-react';

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
    complianceDate: z.string().optional(),
    buildDate: z.string().optional(),
    year: z.string().optional(),
    licensePlate: z.string().optional(),
    bookingNumber: z.string().optional(),
  }).optional(),
  checklist: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      items: z.array(
        z.object({
          item: z.string().min(1, 'Item is required'),
          status: z.enum(['OK', 'C', 'A', 'R', 'RP', 'N', 'pass', 'fail', 'na']),
          notes: z.string().optional(),
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
  signatures: z.object({
    technician: z.string().optional(),
    manager: z.string().optional(),
  }).optional(),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'Privacy consent is required',
  }),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const defaultChecklist = [
  {
    category: 'Pre-Inspection',
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

interface InspectionFormProps {
  inspectionId?: string;
  initialData?: any;
  readOnly?: boolean;
}

export default function InspectionForm({ inspectionId, initialData, readOnly = false }: InspectionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [signatures, setSignatures] = useState({
    technician: initialData?.signatures?.technician || '',
    manager: initialData?.signatures?.manager || '',
  });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [draftId, setDraftId] = useState<string | null>(inspectionId || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const totalSteps = 6;
  const steps = [
    { number: 1, title: 'Inspector Info', icon: User },
    { number: 2, title: 'Vehicle & Identification', icon: Car },
    { number: 3, title: 'GPS & Photos', icon: MapPin },
    { number: 4, title: 'Checklist', icon: ClipboardCheck },
    { number: 5, title: 'Disclaimer', icon: FileText },
    { number: 6, title: 'Signatures', icon: PenTool },
  ];

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
    defaultValues: initialData || {
      inspectorName: '',
      inspectorEmail: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      checklist: defaultChecklist,
      photos: [],
      privacyConsent: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklist',
  });

  // Auto-fetch inspector email from logged-in user and load existing draft
  useEffect(() => {
    if (readOnly || initialData || inspectionId) return; // Skip if read-only, has initial data, or editing existing inspection
    
    const fetchUserAndDraft = async () => {
      try {
        // Fetch user email first
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        if (userData.success && userData.user && userData.user.email) {
          // Auto-populate inspector email and name
          setValue('inspectorEmail', userData.user.email);
          if (userData.user.name && !getValues('inspectorName')) {
            setValue('inspectorName', userData.user.name);
          }
          
          // Check for existing draft
          const draftResponse = await fetch('/api/inspections?status=draft');
          const draftData = await draftResponse.json();
          
          if (draftData.success && draftData.data && draftData.data.length > 0) {
            // Find the most recent draft for this user
            const userDrafts = draftData.data.filter((draft: any) => 
              draft.inspectorEmail?.toLowerCase() === userData.user.email.toLowerCase() && 
              draft.status === 'draft'
            );
            
            if (userDrafts.length > 0) {
              // Sort by updatedAt descending to get the most recent
              const mostRecentDraft = userDrafts.sort((a: any, b: any) => 
                new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
              )[0];
              
              // Load draft data into form
              setDraftId(mostRecentDraft._id);
              
              // Update form values with draft data
              if (mostRecentDraft.inspectorName) {
                setValue('inspectorName', mostRecentDraft.inspectorName);
              }
              if (mostRecentDraft.inspectorEmail) {
                setValue('inspectorEmail', mostRecentDraft.inspectorEmail);
              }
              if (mostRecentDraft.inspectionDate) {
                const date = new Date(mostRecentDraft.inspectionDate);
                setValue('inspectionDate', date.toISOString().split('T')[0]);
              }
              if (mostRecentDraft.vehicleInfo) {
                Object.entries(mostRecentDraft.vehicleInfo).forEach(([key, value]) => {
                  if (value) {
                    setValue(`vehicleInfo.${key}` as any, value);
                  }
                });
              }
              if (mostRecentDraft.checklist && mostRecentDraft.checklist.length > 0) {
                setValue('checklist', mostRecentDraft.checklist);
              }
              if (mostRecentDraft.barcode) {
                setBarcode(mostRecentDraft.barcode);
              }
              if (mostRecentDraft.location) {
                setLocation(mostRecentDraft.location);
              }
              if (mostRecentDraft.photos && mostRecentDraft.photos.length > 0) {
                setPhotos(mostRecentDraft.photos.map((p: any) => 
                  typeof p === 'string' ? { fileName: p } : p
                ));
              }
              if (mostRecentDraft.signatures) {
                setSignatures(mostRecentDraft.signatures);
              }
              if (mostRecentDraft.privacyConsent !== undefined) {
                setValue('privacyConsent', mostRecentDraft.privacyConsent);
              }
              
              // Update URL to show draft ID without reloading
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', `/inspections/${mostRecentDraft._id}`);
              }
              
              // Show notification that draft was loaded
              setToast({
                message: 'Draft loaded successfully. Continuing where you left off...',
                type: 'info'
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user email or draft:', error);
      }
    };
    
    fetchUserAndDraft();
  }, [readOnly, initialData, inspectionId, setValue, getValues]);

  // Check authentication periodically and on visibility change
  useEffect(() => {
    if (readOnly) return; // Skip auth check for read-only mode
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
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

  // Auto-save draft function
  const saveDraft = useCallback(async (silent = true) => {
    if (readOnly || isSavingDraft) return; // Skip if read-only or already saving
    
    const values = getValues();
    
    // Don't save empty drafts
    if (!values.inspectorName && !values.inspectorEmail && !values.inspectionDate) {
      return;
    }
    
    setIsSavingDraft(true);
    
    try {
      const draftData = {
        inspectorName: values.inspectorName || '',
        inspectorEmail: values.inspectorEmail || '',
        inspectionDate: values.inspectionDate || new Date().toISOString().split('T')[0],
        vehicleInfo: values.vehicleInfo || {},
        checklist: values.checklist || defaultChecklist,
        location: location.start || location.current ? location : {},
        barcode: barcode || undefined,
        photos: photos || [],
        signatures: signatures.technician || signatures.manager ? signatures : undefined,
        status: 'draft' as const,
        privacyConsent: values.privacyConsent || false,
      };
      
      let savedDraftId = draftId;
      
      if (!savedDraftId) {
        // Create new draft
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });
        
        const result = await response.json();
        
        if (result.success && result.data?._id) {
          savedDraftId = result.data._id;
          setDraftId(savedDraftId);
          
          // Update URL without reloading page
          if (typeof window !== 'undefined' && !inspectionId) {
            window.history.replaceState({}, '', `/inspections/${savedDraftId}`);
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
  }, [readOnly, isSavingDraft, getValues, location, barcode, photos, signatures, draftId, inspectionId, setDraftId, setToast]);

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
      if (document.visibilityState === 'hidden') {
        saveDraft(true); // Silent save when tab becomes hidden
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
      const values = getValues();
      // Only save if there's actual data entered
      if (values.inspectorName || values.inspectorEmail || values.inspectionDate || barcode || photos.length > 0) {
        saveDraft(true); // Silent save
      }
    }, 5000); // Debounce for 5 seconds after last change
    
    return () => clearTimeout(debounceTimer);
  }, [readOnly, isAuthenticated, getValues, barcode, photos, location, saveDraft]);

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
      const currentResponse = await fetch(`/api/inspections/${idToUse}`);
      const currentResult = await currentResponse.json();
      
      if (!currentResult.success) {
        throw new Error('Failed to fetch current inspection data');
      }

      const currentData = currentResult.data;
      
      // Merge section data with current data
      const updatedData = {
        ...currentData,
        ...sectionData,
      };

      const response = await fetch(`/api/inspections/${idToUse}`, {
        method: 'PUT',
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
    const formData = {
      inspectorName: values.inspectorName,
      inspectorEmail: values.inspectorEmail,
      inspectionDate: values.inspectionDate,
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
    await saveSection('photos', { photos });
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
      const authResponse = await fetch('/api/auth/me');
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
        setCurrentStep(allStepsValidation.step);
      }
      return;
    }

    // Use draftId if exists, otherwise use inspectionId
    const idToUse = draftId || inspectionId;
    
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
          inspectionNumber: `INSP-${Date.now()}`,
          inspectionDate: new Date(data.inspectionDate),
          location: locationData,
          barcode: barcode || undefined,
          photos: photos || [],
          signatures: (signatures.technician || signatures.manager) ? signatures : undefined,
          status: 'completed' as const, // Set to completed when user submits
        };

        console.log('Submitting inspection data:', inspectionData);

        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspectionData),
        });

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
          setSuccess(true);
          setDraftId(result.data._id); // Set draftId in case user needs to continue
          setToast({
            message: 'Inspection completed successfully!',
            type: 'success'
          });
          // Redirect to the inspection detail page
          setTimeout(() => {
          window.location.href = `/inspections/${result.data._id}`;
          }, 1500);
        } else {
          const errorMessage = result.error || 'Failed to create inspection. Please try again.';
          setToast({
            message: errorMessage,
            type: 'error'
          });
          console.error('Form submission error:', result);
        }
      } catch (error: any) {
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
        inspectionNumber: idToUse || `INSP-${Date.now()}`,
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
        signatures: (signatures.technician || signatures.manager) ? signatures : undefined,
        status: 'completed' as const, // Mark as completed when user submits
      };

      const response = await fetch(`/api/inspections/${idToUse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setToast({
          message: 'Inspection completed successfully!',
          type: 'success'
        });
        // Redirect to the inspection detail page
        setTimeout(() => {
          window.location.href = `/inspections/${idToUse}`;
        }, 1500);
      } else {
        setToast({
          message: result.error || 'Failed to save inspection',
          type: 'error'
        });
      }
    } catch (error: any) {
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
    switch (step) {
      case 1:
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
      case 2:
        // Vehicle info validation - at least VIN or License Plate should be provided
        const vehicleInfo = values.vehicleInfo || {};
        if (!vehicleInfo.vin && !vehicleInfo.licensePlate && !vehicleInfo.bookingNumber) {
          return { valid: false, error: 'Please provide at least VIN, License Plate, or Booking Number' };
        }
        return { valid: true };
      case 3:
        // GPS and photos validation
        if (!location || (!location.current && !location.start)) {
          return { valid: false, error: 'Please capture GPS location before proceeding' };
        }
        if (!photos || photos.length === 0) {
          return { valid: false, error: 'Please upload at least one photo' };
        }
        return { valid: true };
      case 4:
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
          }
        }
        return { valid: true };
      case 5:
        // Disclaimer - just needs to be viewed, no validation needed
        return { valid: true };
      case 6:
        // Signatures and privacy consent validation
        if (!values.privacyConsent) {
          return { valid: false, error: 'Privacy consent is required to proceed' };
        }
        if (!signatures.technician && !signatures.manager) {
          return { valid: false, error: 'At least one signature (Technician or Manager) is required' };
        }
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const handleNext = async () => {
    // Check authentication before proceeding
    try {
      const authResponse = await fetch('/api/auth/me');
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
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30">
      <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30">
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30">
            <span className="text-white font-bold text-lg">1</span>
          </div>
          <h2 className="text-xl font-bold text-black">Inspector Information</h2>
        </div>
        {!readOnly && inspectionId && (
          <button
            type="button"
            onClick={saveInspectorInfo}
            disabled={sectionSaving.inspectorInfo}
            className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
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
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
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
      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-black">Vehicle Identification Scan</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveBarcode}
              disabled={sectionSaving.barcode}
              className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
          onScan={(code, type) => {
            if (!readOnly) {
              setBarcode(code);
              if (type) setBarcodeType(type);
            }
          }} 
          value={barcode}
          scanType="ANY"
          readOnly={readOnly}
        />
      </div>

      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30 ${readOnly ? 'mt-6' : ''}`}>
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h2 className="text-xl font-bold text-black">Vehicle Information</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveVehicleInfo}
              disabled={sectionSaving.vehicleInfo}
              className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.make')}
            placeholder="Make"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.model')}
            placeholder="Model"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.dealerStockNo')}
            placeholder="Dealer Stock No"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.vin')}
            placeholder="VIN"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.engine')}
            placeholder="Engine"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <input
            {...register('vehicleInfo.odometer')}
            placeholder="Odometer"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
          <div>
            <label className="block text-xs text-black mb-1">Compliance Date</label>
            <input
              {...register('vehicleInfo.complianceDate')}
              type="date"
              disabled={readOnly}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
            />
          </div>
          <div>
            <label className="block text-xs text-black mb-1">Build Date</label>
            <input
              {...register('vehicleInfo.buildDate')}
              type="date"
              disabled={readOnly}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
            />
          </div>
          <input
            {...register('vehicleInfo.licensePlate')}
            placeholder="License Plate"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
        </div>
        <div>
          <input
            {...register('vehicleInfo.bookingNumber')}
            placeholder="Booking Number"
            disabled={readOnly}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
          />
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-black">GPS Location</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveGPSLocation}
              disabled={sectionSaving.location}
              className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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

      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? 'mt-6' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-black">General Photos</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={savePhotos}
              disabled={sectionSaving.photos}
              className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} readOnly={readOnly} />
      </div>
    </>
  );

  const renderStep4 = () => {
    const isExterior = (categoryName: string) => {
      const name = categoryName?.toLowerCase() || '';
      return name.includes('exterior') || name.includes('outside') || name.includes('external');
    };

    const isInterior = (categoryName: string) => {
      const name = categoryName?.toLowerCase() || '';
      return name.includes('interior') || name.includes('inside') || name.includes('internal');
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30">
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30">
              <span className="text-white font-bold text-lg">4</span>
            </div>
            <h2 className="text-xl font-bold text-black">Inspection Checklist</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveChecklist}
              disabled={sectionSaving.checklist}
              className="flex items-center px-3 py-1.5 text-sm bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {sectionSaving.checklist ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
                  Saving...
                </>
              ) : sectionSaved.checklist ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1.5" />
                  Save
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Codes Legend */}
        <div className="mb-6 p-4 bg-[#0033FF]/10 border-2 border-[#0033FF]/30 rounded-xl">
          <h3 className="text-sm font-bold text-black mb-3">Action Codes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-300">OK</span>
              <span className="text-black">= Satisfactory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-black">C</span>
              <span className="text-slate-300">= Clean</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-300">A</span>
              <span className="text-slate-300">= Adjust</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-black">R</span>
              <span className="text-slate-300">= Repair</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-300">RP</span>
              <span className="text-slate-300">= Replace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-black">N</span>
              <span className="text-slate-300">= Not applicable</span>
            </div>
          </div>
        </div>

        {fields.map((category, categoryIndex) => {
          const categoryName = category.category || '';
          const isExt = isExterior(categoryName);
          const isInt = isInterior(categoryName);
          
          return (
            <div 
              key={category.id} 
              className={`border-2 rounded-xl p-4 ${
                isExt 
                  ? 'border-blue-200 bg-blue-50' 
                  : isInt 
                  ? 'border-amber-200 bg-amber-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                isExt ? 'border-blue-300' : isInt ? 'border-amber-300' : 'border-gray-300'
              }`}>
                {isExt && <span className="text-2xl">🚗</span>}
                {isInt && <span className="text-2xl">🚙</span>}
                <h3 className={`text-base font-bold ${
                  isExt ? 'text-blue-700' : isInt ? 'text-amber-700' : 'text-black'
                }`}>
                  {categoryName || `Category ${categoryIndex + 1}`}
                </h3>
              </div>
              <input
                {...register(`checklist.${categoryIndex}.category`)}
                disabled={readOnly}
                className={`w-full px-3 py-2 text-sm border rounded-lg mb-3 focus:ring-2 focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${
                  isExt 
                    ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-400' 
                    : isInt 
                    ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-400' 
                    : 'border-gray-300 focus:ring-[#0033FF] focus:border-[#0033FF]'
                } ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
                placeholder="Category name"
              />

              {category.items?.map((item: any, itemIndex: number) => {
                const itemPhotos = watch(`checklist.${categoryIndex}.items.${itemIndex}.photos`) ?? item.photos ?? [];
                return (
                  <div 
                    key={itemIndex} 
                    className={`mb-3 p-3 rounded-lg border ${
                      isExt 
                        ? 'bg-blue-50 border-blue-200' 
                        : isInt 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <input
                        {...register(`checklist.${categoryIndex}.items.${itemIndex}.item`)}
                        disabled={readOnly}
                        className={`flex-1 w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${
                          isExt 
                            ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-400' 
                            : isInt 
                            ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-400' 
                            : 'border-gray-300 focus:ring-[#0033FF] focus:border-[#0033FF]'
                        } ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
                        placeholder="Item name"
                      />
                      <select
                        {...register(`checklist.${categoryIndex}.items.${itemIndex}.status`)}
                        disabled={readOnly}
                        className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:bg-white transition-all bg-white text-black font-medium w-full sm:w-auto ${
                          isExt 
                            ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-400' 
                            : isInt 
                            ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-400' 
                            : 'border-gray-300 focus:ring-[#0033FF] focus:border-[#0033FF]'
                        } ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
                      >
                        <option value="OK">✅ OK - Satisfactory</option>
                        <option value="C">🧹 C - Clean</option>
                        <option value="A">🔧 A - Adjust</option>
                        <option value="R">🔨 R - Repair</option>
                        <option value="RP">🔄 RP - Replace</option>
                        <option value="N">➖ N - Not applicable</option>
                        <option value="pass">✅ Pass (Legacy)</option>
                        <option value="fail">❌ Fail (Legacy)</option>
                        <option value="na">➖ N/A (Legacy)</option>
                      </select>
                    </div>
                    <textarea
                      {...register(`checklist.${categoryIndex}.items.${itemIndex}.notes`)}
                      placeholder="Notes (optional)"
                      disabled={readOnly}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:bg-white transition-all bg-white text-black placeholder-gray-400 resize-none mb-2 ${
                          isExt 
                            ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-400' 
                            : isInt 
                            ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-400' 
                            : 'border-gray-300 focus:ring-[#0033FF] focus:border-[#0033FF]'
                      } ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}
                      rows={2}
                    />
                    <ItemPhotoUpload
                      photos={itemPhotos}
                      onPhotosChange={(newPhotos: any) => {
                        if (!readOnly) {
                          setValue(`checklist.${categoryIndex}.items.${itemIndex}.photos`, newPhotos);
                        }
                      }}
                      maxPhotos={5}
                      itemName={item.item}
                      readOnly={readOnly}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30">
      <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30">
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30">
            <span className="text-white font-bold text-lg">5</span>
          </div>
          <h2 className="text-xl font-bold text-black">Disclaimer & Terms</h2>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-[#0033FF]/30">
        <h3 className="text-base font-bold text-black mb-4">Pre delivery inspection Pty Ltd - Inspection Disclaimer</h3>
        <div className="text-sm text-black space-y-4 leading-relaxed">
          <p>
            This inspection report has been prepared by <strong className="text-black">Pre delivery inspection Pty Ltd</strong> 
            {" ("}<strong className="text-black">Pre delivery inspection</strong>{") "}to identify potential health or safety hazards commonly 
            associated with recovered stolen vehicles, including but not limited to sharps and meth residue.
          </p>
          <p>
            The inspection is non-invasive, visual in nature, and limited to accessible areas of the vehicle at the time of inspection. 
            No guarantee is made as to the complete absence of hazards and contaminants, and this report does not constitute a mechanical, 
            structural or roadworthiness assessment.
          </p>
          <p>
            While all care has been taken to identify visible or accessible risks, Pre delivery inspection cannot guarantee that all hazards—particularly 
            those hidden, embedded, or requiring forensic-level testing—will be detected. Additional specialist cleaning, decontamination, or 
            forensic testing may be required.
          </p>
          <p>
            This report is intended for use by the client named and should not be relied upon by third parties without written consent from 
            Pre delivery inspection. Whilst Pre delivery inspection its staff and/or contractors, undertake that they have taken due care in undertaking the 
            inspection, it accepts no liability for any loss, injury, or damage arising from the use of this report outside its intended purpose.
          </p>
        </div>
      </div>

      <div className="bg-[#0033FF]/10 border-2 border-[#0033FF]/50 rounded-lg p-4">
        <p className="text-sm text-black font-semibold text-center">
          By proceeding with the signature step, you acknowledge that you have read, understood, and agree to the terms and conditions 
          outlined in this disclaimer.
        </p>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <>
      <div className={`bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30">
              <span className="text-white font-bold text-lg">6</span>
            </div>
            <h2 className="text-xl font-bold text-black">Signatures</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveSignatures}
              disabled={sectionSaving.signatures}
              className="flex items-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
          <SignaturePad
            onSave={(signature) => {
              if (!readOnly) {
                setSignatures({ ...signatures, manager: signature });
                setValue('signatures.manager', signature);
              }
            }}
            label="Manager Signature"
            value={signatures.manager}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 border-2 border-yellow-500/30 ${readOnly ? 'mt-6' : ''}`}>
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            {...register('privacyConsent')}
            disabled={readOnly}
            className={`mt-1 mr-4 w-5 h-5 rounded border-slate-500 text-yellow-500 focus:ring-2 focus:ring-yellow-500 bg-slate-600/50 ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          />
          <span className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">
            I consent to the collection and storage of this inspection data in accordance with
            privacy regulations <span className="text-red-400 font-semibold">*</span>
          </span>
        </label>
        {errors.privacyConsent && (
          <p className="text-red-400 text-sm mt-2 ml-9 font-medium">{errors.privacyConsent.message}</p>
        )}
      </div>
    </>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); }} className="w-full max-w-7xl mx-auto space-y-4 px-0 sm:px-2">
      {success && (
        <div className="p-4 bg-green-900/50 border-2 border-green-500/50 rounded-xl flex items-center animate-fade-in shadow-lg bg-slate-800/95">
          <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
          <span className="text-green-300 font-semibold">Inspection saved successfully!</span>
        </div>
      )}

      {/* Content - Step-by-step for new/editing, all at once for viewing */}
      <div className="flex flex-col">
        <div className={`w-full ${readOnly ? 'space-y-6' : ''}`}>
          {readOnly ? (
            // View mode: Show all sections at once
            <>
              {renderStep1()}
              {renderStep2()}
              {renderStep3()}
              {renderStep4()}
              {renderStep5()}
              {renderStep6()}
            </>
          ) : (
            // Edit/Create mode: Show step-by-step
            renderStepContent()
          )}
        </div>
      </div>

      {/* Navigation Buttons - Only show for new/editing inspections */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t-2 border-slate-700/50">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center justify-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md w-full sm:w-auto ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-800 hover:scale-105'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Previous
          </button>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center justify-center px-4 py-2 text-sm bg-[#0033FF] text-white rounded-lg font-semibold hover:bg-[#0033FF]/90 transition-all shadow-lg shadow-[#0033FF]/50 hover:scale-105 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {inspectionId ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit(onSubmit)()}
                    disabled={submitting}
                    className="flex items-center justify-center px-4 py-2 text-sm bg-[#0033FF] text-white rounded-lg font-bold shadow-lg shadow-[#0033FF]/50 hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1.5"></div>
                        Saving All...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" />
                        Save All Sections
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      console.log('Button clicked, starting form submission...');
                      console.log('Form errors:', errors);
                      console.log('Form values:', getValues());
                      
                      const result = await handleSubmit(
                        (data) => {
                          console.log('Form validation passed, calling onSubmit...');
                          onSubmit(data);
                        },
                        (errors) => {
                          console.log('Form validation failed:', errors);
                          const firstError = Object.values(errors)[0] as any;
                          setToast({
                            message: firstError?.message || 'Please check all required fields',
                            type: 'error'
                          });
                        }
                      )();
                    }}
                    disabled={submitting}
                    className="flex items-center justify-center px-4 py-2 text-sm bg-[#0033FF] text-white rounded-lg font-bold shadow-lg shadow-[#0033FF]/50 hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {submitting ? 'Completing...' : 'Complete Inspection'}
                  </button>
                )}
                {inspectionId && (
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold shadow-lg shadow-pink-500/50 hover:from-pink-500 hover:to-rose-500 transition-all hover:scale-105 w-full sm:w-auto"
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


