'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhotoUpload from './PhotoUpload';
import ItemPhotoUpload from './ItemPhotoUpload';
import BarcodeScanner from './BarcodeScanner';
import EnhancedGPSLocation from './EnhancedGPSLocation';
import SignaturePad from './SignaturePad';
import EmailModal from './EmailModal';
import Toast from './Toast';
import { Save, Send, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const inspectionSchema = z.object({
  inspectorName: z.string().min(1, 'Inspector name is required'),
  inspectorEmail: z.string().email('Valid email is required'),
  inspectionDate: z.string().min(1, 'Inspection date is required'),
  location: z.any().optional(),
  barcode: z.string().optional(),
  vehicleInfo: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    vin: z.string().optional(),
    licensePlate: z.string().optional(),
    bookingNumber: z.string().optional(),
  }).optional(),
  checklist: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      items: z.array(
        z.object({
          item: z.string().min(1, 'Item is required'),
          status: z.enum(['pass', 'fail', 'na']),
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
    category: 'Exterior',
    items: [
      { item: 'Paint condition', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Body panels', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Windows and glass', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Lights and signals', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Tires and wheels', status: 'pass' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Interior',
    items: [
      { item: 'Seats and upholstery', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Dashboard and controls', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Air conditioning', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Audio system', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Safety equipment', status: 'pass' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Mechanical',
    items: [
      { item: 'Engine', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Transmission', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Brakes', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Suspension', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Fluid levels', status: 'pass' as const, notes: '', photos: [] },
    ],
  },
  {
    category: 'Documentation',
    items: [
      { item: 'Registration documents', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Service history', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Warranty information', status: 'pass' as const, notes: '', photos: [] },
      { item: 'Owner manual', status: 'pass' as const, notes: '', photos: [] },
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
    end: undefined,
    roadTest: undefined,
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

  const totalSteps = 6;
  const steps = [
    { number: 1, title: 'Inspector Info', icon: '👤' },
    { number: 2, title: 'Vehicle & Barcode', icon: '🚗' },
    { number: 3, title: 'GPS & Photos', icon: '📍' },
    { number: 4, title: 'Checklist', icon: '✅' },
    { number: 5, title: 'Disclaimer', icon: '📋' },
    { number: 6, title: 'Signatures', icon: '✍️' },
  ];

  const {
    register,
    handleSubmit,
    control,
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

  // Helper function to save a specific section
  const saveSection = async (sectionName: string, sectionData: any) => {
    if (!inspectionId) {
      alert('Cannot save section: Inspection ID is required');
      return;
    }

    setSectionSaving(prev => ({ ...prev, [sectionName]: true }));
    setSectionSaved(prev => ({ ...prev, [sectionName]: false }));

    try {
      // Get current inspection data
      const currentResponse = await fetch(`/api/inspections/${inspectionId}`);
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

      const response = await fetch(`/api/inspections/${inspectionId}`, {
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

    if (!inspectionId) {
      // For new inspections, use the regular flow
      setSubmitting(true);
      setSuccess(false);

      try {
        // Prepare location data - use the location state directly
        const locationData = location.start || location.end || location.current 
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
          status: 'completed', // Set to completed when user submits
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

    // For existing inspections, save everything
    setSubmitting(true);
    setSuccess(false);

    try {
      const inspectionData = {
        ...data,
        inspectionNumber: inspectionId || `INSP-${Date.now()}`,
        inspectionDate: new Date(data.inspectionDate),
        location: location.latitude ? {
          current: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          },
        } : location,
        barcode,
        photos: photos,
        signatures: (signatures.technician || signatures.manager) ? signatures : undefined,
        status: 'draft',
      };

      const response = await fetch(`/api/inspections/${inspectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setToast({
          message: 'Inspection saved successfully!',
          type: 'success'
        });
        setTimeout(() => setSuccess(false), 3000);
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
        if (!location || (!location.current && !location.start && !location.end)) {
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

  const handleNext = () => {
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
    <div className="bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-blue-500/30">
      <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-blue-400/30">
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/50 flex-shrink-0">
            <span className="text-white font-bold text-base">1</span>
          </div>
          <h2 className="text-xl font-bold text-blue-200">Inspector Information</h2>
        </div>
        {!readOnly && inspectionId && (
          <button
            type="button"
            onClick={saveInspectorInfo}
            disabled={sectionSaving.inspectorInfo}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Inspector Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register('inspectorName')}
            disabled={readOnly}
            className={`w-full px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          {errors.inspectorName && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.inspectorName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Inspector Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            {...register('inspectorEmail')}
            disabled={readOnly}
            className={`w-full px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          {errors.inspectorEmail && (
            <p className="text-red-400 text-xs mt-1 font-medium">{errors.inspectorEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Inspection Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            {...register('inspectionDate')}
            disabled={readOnly}
            className={`w-full px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all bg-slate-600/50 text-white ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
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
      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 border-2 border-purple-500/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-200">Barcode / QR Code</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveBarcode}
              disabled={sectionSaving.barcode}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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

      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-orange-500/30 ${readOnly ? 'mt-6' : ''}`}>
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-orange-400/30">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/50 flex-shrink-0">
              <span className="text-white font-bold text-base">2</span>
            </div>
            <h2 className="text-xl font-bold text-orange-200">Vehicle Information</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveVehicleInfo}
              disabled={sectionSaving.vehicleInfo}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
        <div className="grid md:grid-cols-2 gap-3">
          <input
            {...register('vehicleInfo.make')}
            placeholder="Make"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          <input
            {...register('vehicleInfo.model')}
            placeholder="Model"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          <input
            {...register('vehicleInfo.year')}
            placeholder="Year"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          <input
            {...register('vehicleInfo.vin')}
            placeholder="VIN"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
          <input
            {...register('vehicleInfo.licensePlate')}
            placeholder="License Plate"
            disabled={readOnly}
            className={`px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
        </div>
        <div>
          <input
            {...register('vehicleInfo.bookingNumber')}
            placeholder="Booking Number"
            disabled={readOnly}
            className={`w-full px-3 py-2 text-sm border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
          />
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 border-2 border-green-500/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-green-200">GPS Location & Road Test</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveGPSLocation}
              disabled={sectionSaving.location}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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

      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 border-2 border-pink-500/30 ${readOnly ? 'mt-6' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-pink-200">General Photos</h3>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={savePhotos}
              disabled={sectionSaving.photos}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
      <div className="bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-purple-500/30">
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-purple-400/30">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/50 flex-shrink-0">
              <span className="text-white font-bold text-base">3</span>
            </div>
            <h2 className="text-xl font-bold text-purple-200">Inspection Checklist</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveChecklist}
              disabled={sectionSaving.checklist}
              className="flex items-center px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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

        {fields.map((category, categoryIndex) => {
          const categoryName = category.category || '';
          const isExt = isExterior(categoryName);
          const isInt = isInterior(categoryName);
          
          return (
            <div 
              key={category.id} 
              className={`border-2 rounded-xl p-4 ${
                isExt 
                  ? 'border-blue-500/50 bg-blue-900/20' 
                  : isInt 
                  ? 'border-amber-500/50 bg-amber-900/20' 
                  : 'border-slate-500/30 bg-slate-700/50'
              }`}
            >
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                isExt ? 'border-blue-400/30' : isInt ? 'border-amber-400/30' : 'border-slate-500/30'
              }`}>
                {isExt && <span className="text-2xl">🚗</span>}
                {isInt && <span className="text-2xl">🚙</span>}
                <h3 className={`text-base font-bold ${
                  isExt ? 'text-blue-200' : isInt ? 'text-amber-200' : 'text-purple-200'
                }`}>
                  {categoryName || `Category ${categoryIndex + 1}`}
                </h3>
              </div>
              <input
                {...register(`checklist.${categoryIndex}.category`)}
                disabled={readOnly}
                className={`w-full px-3 py-2 text-sm border rounded-lg mb-3 focus:ring-2 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${
                  isExt 
                    ? 'border-blue-500/50 focus:ring-blue-500 focus:border-blue-400' 
                    : isInt 
                    ? 'border-amber-500/50 focus:ring-amber-500 focus:border-amber-400' 
                    : 'border-slate-500/50 focus:ring-purple-500 focus:border-purple-400'
                } ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
                placeholder="Category name"
              />

              {category.items?.map((item: any, itemIndex: number) => {
                const itemPhotos = item.photos || [];
                return (
                  <div 
                    key={itemIndex} 
                    className={`mb-3 p-3 rounded-lg border ${
                      isExt 
                        ? 'bg-blue-900/10 border-blue-500/30' 
                        : isInt 
                        ? 'bg-amber-900/10 border-amber-500/30' 
                        : 'bg-gradient-to-r from-slate-600/50 to-slate-700/50 border-slate-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <input
                        {...register(`checklist.${categoryIndex}.items.${itemIndex}.item`)}
                        disabled={readOnly}
                        className={`flex-1 w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 transition-all bg-slate-600/50 text-white placeholder-slate-400 ${
                          isExt 
                            ? 'border-blue-500/50 focus:ring-blue-500 focus:border-blue-400' 
                            : isInt 
                            ? 'border-amber-500/50 focus:ring-amber-500 focus:border-amber-400' 
                            : 'border-slate-500/50 focus:ring-purple-500 focus:border-purple-400'
                        } ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
                        placeholder="Item name"
                      />
                      <select
                        {...register(`checklist.${categoryIndex}.items.${itemIndex}.status`)}
                        disabled={readOnly}
                        className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 transition-all bg-slate-600/50 text-white font-medium w-full sm:w-auto ${
                          isExt 
                            ? 'border-blue-500/50 focus:ring-blue-500 focus:border-blue-400' 
                            : isInt 
                            ? 'border-amber-500/50 focus:ring-amber-500 focus:border-amber-400' 
                            : 'border-slate-500/50 focus:ring-purple-500 focus:border-purple-400'
                        } ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
                      >
                        <option value="pass" className="bg-slate-700">✅ Pass</option>
                        <option value="fail" className="bg-slate-700">❌ Fail</option>
                        <option value="na" className="bg-slate-700">➖ N/A</option>
                      </select>
                    </div>
                    <textarea
                      {...register(`checklist.${categoryIndex}.items.${itemIndex}.notes`)}
                      placeholder="Notes (optional)"
                      disabled={readOnly}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 transition-all bg-slate-600/50 text-white placeholder-slate-400 resize-none mb-2 ${
                        isExt 
                          ? 'border-blue-500/50 focus:ring-blue-500 focus:border-blue-400' 
                          : isInt 
                          ? 'border-amber-500/50 focus:ring-amber-500 focus:border-amber-400' 
                          : 'border-slate-500/50 focus:ring-purple-500 focus:border-purple-400'
                      } ${readOnly ? 'bg-slate-700/50 cursor-not-allowed opacity-60' : 'hover:bg-slate-600/70'}`}
                      rows={2}
                    />
                    <ItemPhotoUpload
                      photos={itemPhotos}
                      onPhotosChange={(newPhotos) => {
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
    <div className="bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-yellow-500/30">
      <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-yellow-400/30">
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mr-3 shadow-lg shadow-yellow-500/50 flex-shrink-0">
            <span className="text-white font-bold text-base">5</span>
          </div>
          <h2 className="text-xl font-bold text-yellow-200">Disclaimer & Terms</h2>
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4 md:p-6 border border-yellow-500/30">
        <h3 className="text-base font-bold text-yellow-200 mb-4">Hazard Inspect Pty Ltd - Inspection Disclaimer</h3>
        <div className="text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            This inspection report has been prepared by <strong className="text-yellow-200">Hazard Inspect Pty Ltd</strong> 
            {" ("}<strong className="text-yellow-200">Hazard Inspect</strong>{") "}to identify potential health or safety hazards commonly 
            associated with recovered stolen vehicles, including but not limited to sharps and meth residue.
          </p>
          <p>
            The inspection is non-invasive, visual in nature, and limited to accessible areas of the vehicle at the time of inspection. 
            No guarantee is made as to the complete absence of hazards and contaminants, and this report does not constitute a mechanical, 
            structural or roadworthiness assessment.
          </p>
          <p>
            While all care has been taken to identify visible or accessible risks, Hazard Inspect cannot guarantee that all hazards—particularly 
            those hidden, embedded, or requiring forensic-level testing—will be detected. Additional specialist cleaning, decontamination, or 
            forensic testing may be required.
          </p>
          <p>
            This report is intended for use by the client named and should not be relied upon by third parties without written consent from 
            Hazard Inspect. Whilst Hazard Inspect its staff and/or contractors, undertake that they have taken due care in undertaking the 
            inspection, it accepts no liability for any loss, injury, or damage arising from the use of this report outside its intended purpose.
          </p>
        </div>
      </div>

      <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
        <p className="text-sm text-yellow-200 font-semibold text-center">
          By proceeding with the signature step, you acknowledge that you have read, understood, and agree to the terms and conditions 
          outlined in this disclaimer.
        </p>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <>
      <div className={`bg-slate-800/95 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-green-500/30 ${readOnly ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between py-4 px-1 mb-4 border-b-2 border-green-400/30">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg shadow-green-500/50 flex-shrink-0">
              <span className="text-white font-bold text-base">6</span>
            </div>
            <h2 className="text-xl font-bold text-green-200">Signatures</h2>
          </div>
          {!readOnly && inspectionId && (
            <button
              type="button"
              onClick={saveSignatures}
              disabled={sectionSaving.signatures}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
        
        <div className="grid md:grid-cols-2 gap-6">
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
    <form onSubmit={(e) => { e.preventDefault(); }} className="w-full max-w-7xl mx-auto space-y-4">
      {success && (
        <div className="p-4 bg-green-900/50 border-2 border-green-500/50 rounded-xl flex items-center animate-fade-in shadow-lg bg-slate-800/95">
          <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
          <span className="text-green-300 font-semibold">Inspection saved successfully!</span>
        </div>
      )}

      {/* Progress Indicator - Only show for new/editing inspections */}
      {!readOnly && (
        <div className="bg-slate-800/95 rounded-2xl shadow-xl p-4 border-2 border-purple-500/30 mb-4">
          <div className="grid grid-cols-6 gap-1 mb-3">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                      : currentStep === step.number
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/50 scale-110'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                  currentStep >= step.number ? 'text-purple-200' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-300">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
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
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:scale-105'
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
                className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/50 hover:scale-105 w-full sm:w-auto"
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
                    className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-purple-500/50 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 w-full sm:w-auto"
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
                    className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-purple-500/50 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 w-full sm:w-auto"
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


