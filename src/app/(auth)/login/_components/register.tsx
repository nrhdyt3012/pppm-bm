// import { Button, Card, CardBody, Input } from "@heroui/react";
// import Image from "next/image";
// import Link from "next/link";
// import useRegister from "./useRegister";
// import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
// import { Controller } from "react-hook-form";
// import { Spinner } from "@heroui/react";
// import { error } from "console";
// import { p } from "framer-motion/client";
// import { cn } from "@/utils/cn";

// const Register = () => {
//   const {
//     visiblePassword,
//     handleVisiblePassword,
//     control,
//     handleSubmit,
//     handleRegister,
//     isPendingRegister,
//     errors,
//   } = useRegister();
//   console.log(errors);
//   return (
//     <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
//       <div className="flex w-full lg:w-1/3 flex-col items-center justify-center gap-10">
//         <Image
//           src="/images/general/logo.svg"
//           alt="logo"
//           width={180}
//           height={180}
//         />

//         <Image
//           src="/images/illustrations/login.svg"
//           alt="logo"
//           className="w-2/3 lg:w-full"
//           width={1024}
//           height={1024}
//         />
//       </div>
//       <Card>
//         <CardBody className="p-8">
//           <h2 className="text-xl font-bold text-danger">Create Account</h2>
//           <p className="text-small mb-4">
//             Have an account ?&nbsp;
//             <Link href="/auth/login" className="font-semibold text-danger-400">
//               Login here
//             </Link>
//           </p>
//           {errors.root && (
//             <p className="mb-2 font-medium text-danger-400 text-center">
//               {errors.root?.message}
//             </p>
//           )}
//           <form
//             className={cn(
//               "flex flex-col",
//               Object.keys(errors).length > 0 ? "gap-2" : "gap-4"
//             )}
//             onSubmit={handleSubmit(handleRegister)}
//           >
//             <Controller
//               name="fullName"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   //field ini agar bisa diisi dengan data dari form tanpa perlu mengetik satu-satu
//                   value={field.value}
//                   onChange={field.onChange}
//                   name={field.name}
//                   type="text"
//                   label="Fullname"
//                   variant="bordered"
//                   autoComplete="off"
//                   isInvalid={errors.fullName !== undefined}
//                   errorMessage={errors.fullName?.message}
//                 />
//               )}
//             />

//             <Controller
//               name="username"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   //field ini agar bisa diisi dengan data dari form tanpa perlu mengetik satu-satu
//                   value={field.value}
//                   onChange={field.onChange}
//                   name={field.name}
//                   type="text"
//                   label="username"
//                   variant="bordered"
//                   autoComplete="off"
//                   isInvalid={errors.username !== undefined}
//                   errorMessage={errors.username?.message}
//                 />
//               )}
//             />

//             <Controller
//               name="email"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   //field ini agar bisa diisi dengan data dari form tanpa perlu mengetik satu-satu
//                   value={field.value}
//                   onChange={field.onChange}
//                   name={field.name}
//                   type="email"
//                   label="Email"
//                   variant="bordered"
//                   autoComplete="off"
//                   isInvalid={errors.email !== undefined}
//                   errorMessage={errors.email?.message}
//                 />
//               )}
//             />

//             <Controller
//               name="password"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   //field bertujuan agar yg dimiliki field bisa didapatkan di input jg
//                   value={field.value}
//                   onChange={field.onChange}
//                   name={field.name}
//                   type={visiblePassword.password ? "text" : "password"}
//                   label="Password"
//                   variant="bordered"
//                   autoComplete="off"
//                   endContent={
//                     <button
//                       className="focus:outline-none"
//                       type="button"
//                       onClick={() => handleVisiblePassword("password")}
//                     >
//                       {visiblePassword.password ? (
//                         <IoEyeSharp className="text-xl text-default-400 pointer-events-none" />
//                       ) : (
//                         <IoEyeOffSharp className="text-xl text-default-400 pointer-events-none" />
//                       )}
//                     </button>
//                   }
//                   isInvalid={errors.password !== undefined}
//                   errorMessage={errors.password?.message}
//                 />
//               )}
//             />

//             <Controller
//               name="confirmPassword"
//               control={control}
//               render={({ field }) => (
//                 <Input
//                   value={field.value}
//                   onChange={field.onChange}
//                   name={field.name}
//                   type={visiblePassword.confirmPassword ? "text" : "password"}
//                   label="Password Confirmation"
//                   variant="bordered"
//                   autoComplete="off"
//                   endContent={
//                     <button
//                       className="focus:outline-none"
//                       type="button"
//                       onClick={() => handleVisiblePassword("confirmPassword")}
//                     >
//                       {visiblePassword.confirmPassword ? (
//                         <IoEyeSharp className="text-xl text-default-400 pointer-events-none" />
//                       ) : (
//                         <IoEyeOffSharp className="text-xl text-default-400 pointer-events-none" />
//                       )}
//                     </button>
//                   }
//                   isInvalid={errors.confirmPassword !== undefined}
//                   errorMessage={errors.confirmPassword?.message}
//                 />
//               )}
//             />
//             <Button color="danger" size="lg" type="submit">
//               {isPendingRegister ? (
//                 <Spinner
//                   color="primary"
//                   size="sm"
//                   label="spinner"
//                   variant="spinner"
//                 />
//               ) : (
//                 "Register"
//               )}
//             </Button>
//           </form>
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

// export default Register;
