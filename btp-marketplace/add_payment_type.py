import re

with open('src/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_interface = """
export interface PaymentRequest {
  id: string;
  userId: string;
  requestedPlan: 'premium' | 'vip';
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  // Extra fields for Admin view joining with profiles
  userName?: string;
  userPhone?: string;
  userWhatsapp?: string;
}
"""

if 'export interface PaymentRequest' not in content:
    content += new_interface

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(content)
