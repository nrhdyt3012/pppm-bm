import { z } from 'zod';
export const menuFormSchema = z.object({
          periode: z.string().min(1, 'Periode is required'),
          description: z.string().min(1, 'Description is required'),
          uang_makan: z.string().min(1, 'Uang Makan is required'),
          asrama: z.string().min(1, 'Asrama is required'),
          kas_pondok: z.string().min(1, 'Kas Pondok is required'),
          sedekah_sukarela: z.string().min(1, 'Sedekah Sukarela is required'),  // UBAH",
          aset_jariyah: z.string().min(1, 'Aset Jariyah is required'),          // UBAH",
          uang_tahunan: z.string().min(1, 'Uang Tahunan is required'),
          iuran_kampung: z.string().min(1, 'Iuran Kampung is required'),
        });
        
        export const menuSchema = z.object({
          id_masterTagihan: z.number().optional(),           
          periode: z.string(),
          description: z.string(),
          uang_makan: z.number(),
          asrama: z.number(),
          kas_pondok: z.number(),
          sedekah_sukarela: z.number(),   // UBAH dari shodaqoh_sukarela",
          aset_jariyah: z.number(),        // UBAH dari jariyah_sb",
          uang_tahunan: z.number(),
          iuran_kampung: z.number(),
        });

        export type MenuForm = z.infer<typeof menuFormSchema>;
export type Menu = z.infer<typeof menuSchema>;