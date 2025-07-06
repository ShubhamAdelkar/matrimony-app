import { Button } from "@/components/ui/button"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema } from "@/lib/validation"

function LoginForm() {

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
        },
    });
    function onSubmit(values) {
        console.log(values);
    }
    return (
        // <form className="flex flex-col gap-6">
        //     <div className="flex flex-col items-center gap-2 text-center">
        //         <h1 className="text-2xl font-bold">Login to your account</h1>
        //         <p className="text-muted-foreground text-sm text-balance">
        //             Enter your email below to login to your account
        //         </p>
        //     </div>
        //     <div className="grid gap-6">
        //         <div className="grid gap-3">
        //             <Label htmlFor="email">Email</Label>
        //             <Input id="email" type="email" placeholder="m@example.com" required />
        //         </div>
        //         <div className="grid gap-3">
        //             <div className="flex items-center">
        //                 <Label htmlFor="password">Password</Label>
        //                 <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
        //                     Forgot your password?
        //                 </a>
        //             </div>
        //             <Input id="password" type="password" required />
        //         </div>
        //         <Button type="submit" className="w-full">
        //             Login
        //         </Button>
        //     </div>
        //     <div className="text-center text-sm">
        //         Don&apos;t have an account?{" "}
        //         <a href="#" className="underline underline-offset-4">
        //             Register
        //         </a>
        //     </div>
        // </form>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@email.com" {...field} />
                            </FormControl>
                            <FormDescription>

                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default LoginForm