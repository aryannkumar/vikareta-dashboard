'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { rfqService } from '@/lib/api/services/rfq.service';
import { useToast } from '@/lib/hooks/use-toast';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const rfqSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().min(1, 'Subcategory is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  budgetMin: z.number().min(0, 'Minimum budget must be positive'),
  budgetMax: z.number().min(0, 'Maximum budget must be positive'),
  deliveryTimeline: z.string().min(1, 'Delivery timeline is required'),
  deliveryLocation: z.string().min(1, 'Delivery location is required'),
  specifications: z.array(z.object({
    key: z.string().min(1, 'Specification key is required'),
    value: z.string().min(1, 'Specification value is required'),
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
  })).optional(),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

type RFQFormData = z.infer<typeof rfqSchema>;

export default function NewRFQPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    mode: 'onChange',
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => rfqService.getCategories(),
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', watch('categoryId')],
    queryFn: () => rfqService.getSubcategories(watch('categoryId')),
    enabled: !!watch('categoryId'),
  });

  const createRFQMutation = useMutation({
    mutationFn: rfqService.createRFQ,
    onSuccess: (data) => {
      showToast({
        title: 'RFQ Created',
        message: 'Your RFQ has been created successfully and sent to relevant suppliers.',
        type: 'success',
      });
      router.push(`/dashboard/rfqs/${data.id}`);
    },
    onError: (error: any) => {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to create RFQ',
        type: 'error',
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: rfqService.uploadAttachment,
  });

  const onSubmit = async (data: RFQFormData) => {
    try {
      // Upload attachments first
      const uploadedAttachments = [];
      for (const file of attachments) {
        const uploaded = await uploadAttachmentMutation.mutateAsync(file);
        uploadedAttachments.push(uploaded);
      }

      // Filter out empty specifications
      const validSpecifications = specifications.filter(spec => spec.key && spec.value);

      await createRFQMutation.mutateAsync({
        ...data,
        specifications: validSpecifications,
        attachments: uploadedAttachments,
      });
    } catch (error) {
      console.error('Error creating RFQ:', error);
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const steps = [
    { id: 1, name: 'Basic Information', description: 'RFQ title, description, and category' },
    { id: 2, name: 'Requirements', description: 'Quantity, budget, and specifications' },
    { id: 3, name: 'Delivery & Attachments', description: 'Timeline, location, and files' },
    { id: 4, name: 'Review & Submit', description: 'Review all details before submission' },
  ];

  if (categoriesLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/rfqs">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to RFQs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New RFQ</h1>
            <p className="text-gray-600">Post your requirements to receive quotes from suppliers</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFQ Title *
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Industrial Pumps for Manufacturing Plant"
                  error={errors.title?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed description of your requirements..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    {...register('categoryId')}
                  >
                    <option value="">Select category</option>
                    {categories?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <Select
                    {...register('subcategoryId')}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories?.map((subcategory: any) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </Select>
                  {errors.subcategoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.subcategoryId.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Requirements */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="Enter quantity"
                  error={errors.quantity?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('budgetMin', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.budgetMin?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget (₹) *
                  </label>
                  <Input
                    type="number"
                    {...register('budgetMax', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.budgetMax?.message}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Specifications
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                </div>

                <div className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        placeholder="Specification (e.g., Material)"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value (e.g., Stainless Steel)"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Delivery & Attachments */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Timeline *
                </label>
                <Input
                  {...register('deliveryTimeline')}
                  placeholder="e.g., Within 30 days"
                  error={errors.deliveryTimeline?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location *
                </label>
                <Input
                  {...register('deliveryLocation')}
                  placeholder="e.g., Mumbai, Maharashtra"
                  error={errors.deliveryLocation?.message}
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Drop files here or click to upload
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">RFQ Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    <dl className="mt-2 space-y-1">
                      <div>
                        <dt className="text-sm text-gray-500">Title:</dt>
                        <dd className="text-sm text-gray-900">{watch('title')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Category:</dt>
                        <dd className="text-sm text-gray-900">
                          {categories?.find(c => c.id === watch('categoryId'))?.name}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Requirements</h4>
                    <dl className="mt-2 space-y-1">
                      <div>
                        <dt className="text-sm text-gray-500">Quantity:</dt>
                        <dd className="text-sm text-gray-900">{watch('quantity')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Budget:</dt>
                        <dd className="text-sm text-gray-900">
                          ₹{watch('budgetMin')?.toLocaleString()} - ₹{watch('budgetMax')?.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {specifications.filter(s => s.key && s.value).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900">Specifications</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {specifications
                        .filter(s => s.key && s.value)
                        .map((spec, index) => (
                          <Badge key={index} variant="secondary">
                            {spec.key}: {spec.value}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900">Attachments</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {attachments.length} file(s) attached
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">What happens next?</h4>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• Your RFQ will be sent to relevant suppliers in your category</li>
                  <li>• Suppliers will respond with detailed quotations</li>
                  <li>• You can compare quotes and negotiate with suppliers</li>
                  <li>• Convert the best quote to an order when ready</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || createRFQMutation.isPending}
              >
                {createRFQMutation.isPending ? 'Creating...' : 'Create RFQ'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}