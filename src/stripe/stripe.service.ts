import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { CommonService } from '../common/common.service';
import Stripe from 'stripe';


@Injectable()
export class StripeService {
    private stripe: Stripe;
    constructor(
        private readonly configService: ConfigService,
        private readonly commonService: CommonService,
    ) {
        this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2022-11-15', typescript: true });
    }

    public async refund(payment_intent): Promise<any> {

        return await this.stripe.refunds.create({ payment_intent: String(payment_intent).split("_secret_")[0] });
    }



    public async constructEventFromPayload(signature: string | Buffer | string[], requestBody: string | Buffer): Promise<Stripe.Event> {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        return this.stripe.webhooks.constructEvent(requestBody, signature, webhookSecret);
    }


    public async createCustomer(name: string, email: string) {
        let stripe_customer: any = {};
        const customers = await this.stripe.customers.list({
            limit: 3,
            email: email
        });
        if (customers.data.length > 0) {
            stripe_customer = customers.data[0];
        } else {
            stripe_customer = await this.stripe.customers.create({
                name,
                email
            });
        }
        if (!stripe_customer) {
            throw new BadRequestException('Error creating new customer on Stripe. Please try again');
        }
        return stripe_customer;
    }

    public async charge(amount: number, email: string, name: string) {
        console.log("🚀 ~ file: stripe.service.ts:54 ~ StripeService ~ charge ~ +(amount * 100).toFixed(2)", +(amount * 100).toFixed(2))
        try {
            const stripe_customer = await this.createCustomer(name, email);
            const ephemeralKey = await this.stripe.ephemeralKeys.create(
                { customer: stripe_customer.id },
                { apiVersion: "2020-08-27" }
            );
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: +(amount * 100).toFixed(),
                currency: "GBP",
                customer: stripe_customer.id,
                automatic_payment_methods: {
                    enabled: true,
                }
            });
            return {
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: stripe_customer.id,
            }
        } catch (error) {

            if (error.raw) {
                throw new BadRequestException('stripe: ' + error?.raw?.code);
            }
            if (error.type) {
                throw new BadRequestException('stripe: ' + error.type);
            }
            throw new InternalServerErrorException(error);
        }

    }
}