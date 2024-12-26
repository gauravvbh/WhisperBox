'use client'

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponses';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea"
import { messageSchema } from '@/schemas/messageSchema';


interface MessagePageProps {
  params: {
    username: string;
  };
}

const handleError = (error: unknown, defaultMessage: string) => {
  const axiosError = error as AxiosError<ApiResponse>;
  const errorMessage = axiosError?.response?.data?.message;
  toast({
    title: 'Error',
    description: errorMessage || defaultMessage,
    variant: 'destructive',
  });
};


const MessagePage: React.FC<MessagePageProps> = ({ params }) => {
  const username = params.username;
  const [questions, setQuestions] = useState([
    "What's your favorite movie?",
    "Do you have any pets?",
    "What's your dream job?"
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);


  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ''
    }
  });

  const handleMessageClick = (content: string) => {
    form.setValue('content', content);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);
    try {
      console.log(data)
      const response = await axios.post<ApiResponse>(`/api/send-message`, {
        username,
        content: data.content
      });
      if (response.data.success) {
        toast({
          title: 'Message sent successfully',
          description: 'Your message has been sent to ' + username,
          variant: 'default'
        })
      }
      form.reset({ content: '' });
    } catch (error) {
      handleError(error, 'Sending message failed');
    }
    finally {
      setIsSending(false);
    }
  }

  const fetchSuggestedMessages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/suggest-messages');
      if (response.data.success) {
        const splitQuestions = response?.data?.response?.split('||').map(q => q.trim()) || [];
        setQuestions(splitQuestions);
        toast({
          title: 'Suggestions fetched successfully',
          description: 'Here are some suggestions for your messages',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Error fetching suggestions',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error("Error in signin up", error)
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast({
        title: 'Fetching suggestions failed',
        description: errorMessage ?? 'Error fetching suggestions',
        variant: "destructive"
      })
    }
    finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isSending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit">
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {
              questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleMessageClick(question)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {question}
                </button>
              ))
            }

          </CardContent>


        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  )
}

export default MessagePage