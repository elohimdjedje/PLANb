--
-- PostgreSQL database dump
--

\restrict gNo9WBkcd1HB8HdkRuT9qx6d5fic3A4PpoEgqyuSZHr6E7P70bVorneDnu2Pdrt

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability_calendar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.availability_calendar (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    date date NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    price_override numeric(12,2) DEFAULT NULL::numeric,
    block_reason text
);


ALTER TABLE public.availability_calendar OWNER TO postgres;

--
-- Name: availability_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.availability_calendar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.availability_calendar_id_seq OWNER TO postgres;

--
-- Name: booking_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_payments (
    id integer NOT NULL,
    booking_id integer,
    user_id integer NOT NULL,
    type character varying(20) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'XOF'::character varying NOT NULL,
    status character varying(20) NOT NULL,
    payment_method character varying(20) NOT NULL,
    transaction_id character varying(255) DEFAULT NULL::character varying,
    external_reference character varying(255) DEFAULT NULL::character varying,
    due_date date,
    paid_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone NOT NULL,
    metadata json
);


ALTER TABLE public.booking_payments OWNER TO postgres;

--
-- Name: booking_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.booking_payments_id_seq OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    tenant_id integer,
    owner_id integer NOT NULL,
    room_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    check_in_date date,
    check_out_date date,
    total_amount numeric(12,2) NOT NULL,
    deposit_amount numeric(12,2) NOT NULL,
    monthly_rent numeric(12,2) NOT NULL,
    charges numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(20) NOT NULL,
    deposit_paid boolean DEFAULT false NOT NULL,
    first_rent_paid boolean DEFAULT false NOT NULL,
    deposit_released boolean DEFAULT false NOT NULL,
    requested_at timestamp(0) without time zone NOT NULL,
    accepted_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    confirmed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    tenant_message text,
    owner_response text,
    cancellation_reason text
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bookings_id_seq OWNER TO postgres;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    responded_by_id integer,
    name character varying(100) NOT NULL,
    email character varying(180) NOT NULL,
    subject character varying(50) NOT NULL,
    message text NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    responded_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    response text
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: COLUMN contact_messages.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.contact_messages.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN contact_messages.responded_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.contact_messages.responded_at IS '(DC2Type:datetime_immutable)';


--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_messages_id_seq OWNER TO postgres;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    template_type character varying(50) NOT NULL,
    contract_data json NOT NULL,
    pdf_url text,
    owner_signed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    tenant_signed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    owner_signature_url text,
    tenant_signature_url text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- Name: contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contracts_id_seq OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    buyer_id integer NOT NULL,
    seller_id integer NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    last_message_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: COLUMN conversations.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conversations.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN conversations.last_message_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conversations.last_message_at IS '(DC2Type:datetime_immutable)';


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversations_id_seq OWNER TO postgres;

--
-- Name: doctrine_migration_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctrine_migration_versions (
    version character varying(191) NOT NULL,
    executed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    execution_time integer
);


ALTER TABLE public.doctrine_migration_versions OWNER TO postgres;

--
-- Name: escrow_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.escrow_accounts (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    deposit_amount numeric(12,2) NOT NULL,
    first_rent_amount numeric(12,2) NOT NULL,
    total_held numeric(12,2) NOT NULL,
    status character varying(20) NOT NULL,
    deposit_held_at timestamp(0) without time zone NOT NULL,
    deposit_release_date date,
    deposit_released_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    first_rent_released_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    release_reason text,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.escrow_accounts OWNER TO postgres;

--
-- Name: escrow_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.escrow_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.escrow_accounts_id_seq OWNER TO postgres;

--
-- Name: event_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_images (
    id integer NOT NULL,
    event_id integer NOT NULL,
    url character varying(500) NOT NULL,
    order_position integer NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.event_images OWNER TO postgres;

--
-- Name: COLUMN event_images.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.event_images.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: event_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_images_id_seq OWNER TO postgres;

--
-- Name: event_videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_videos (
    id integer NOT NULL,
    event_id integer NOT NULL,
    url character varying(500) NOT NULL,
    thumbnail character varying(500) DEFAULT NULL::character varying,
    duration integer,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.event_videos OWNER TO postgres;

--
-- Name: COLUMN event_videos.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.event_videos.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: event_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_videos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_videos_id_seq OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    event_date timestamp(0) without time zone NOT NULL,
    event_end_date timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    country character varying(2) NOT NULL,
    city character varying(100) NOT NULL,
    address text NOT NULL,
    specifications json,
    status character varying(20) NOT NULL,
    views_count integer NOT NULL,
    total_tickets_sold integer NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: COLUMN events.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.events.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO postgres;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    listing_id integer NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: COLUMN favorites.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.favorites.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favorites_id_seq OWNER TO postgres;

--
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    id integer NOT NULL,
    listing_id integer,
    user_id integer NOT NULL,
    url character varying(500) NOT NULL,
    thumbnail_url character varying(500) DEFAULT NULL::character varying,
    key character varying(255) DEFAULT NULL::character varying,
    order_position integer NOT NULL,
    status character varying(20) NOT NULL,
    uploaded_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.images OWNER TO postgres;

--
-- Name: COLUMN images.uploaded_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.images.uploaded_at IS '(DC2Type:datetime_immutable)';


--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.images_id_seq OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: late_payment_penalties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.late_payment_penalties (
    id integer NOT NULL,
    payment_id integer NOT NULL,
    booking_id integer NOT NULL,
    days_late integer NOT NULL,
    penalty_rate numeric(5,2) NOT NULL,
    penalty_amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    calculated_at timestamp(0) without time zone NOT NULL,
    paid_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.late_payment_penalties OWNER TO postgres;

--
-- Name: late_payment_penalties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.late_payment_penalties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.late_payment_penalties_id_seq OWNER TO postgres;

--
-- Name: listing_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_views (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    user_id integer,
    ip_address character varying(45) NOT NULL,
    fingerprint character varying(64) DEFAULT NULL::character varying,
    user_agent text,
    referrer character varying(500) DEFAULT NULL::character varying,
    viewed_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.listing_views OWNER TO postgres;

--
-- Name: listing_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listing_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listing_views_id_seq OWNER TO postgres;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    price numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    category character varying(50) NOT NULL,
    subcategory character varying(50) DEFAULT NULL::character varying,
    type character varying(20) NOT NULL,
    country character varying(2) NOT NULL,
    city character varying(100) NOT NULL,
    address text,
    status character varying(20) NOT NULL,
    specifications json,
    views_count integer NOT NULL,
    contacts_count integer NOT NULL,
    is_featured boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    price_unit character varying(10),
    virtual_tour_type character varying(20) DEFAULT NULL::character varying,
    virtual_tour_url text,
    virtual_tour_thumbnail text,
    virtual_tour_data jsonb,
    commune character varying(100) DEFAULT NULL::character varying,
    quartier character varying(100) DEFAULT NULL::character varying,
    contact_phone character varying(20) DEFAULT NULL::character varying,
    contact_whatsapp character varying(20) DEFAULT NULL::character varying,
    contact_email character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: COLUMN listings.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listings_id_seq OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    is_read boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    read_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: COLUMN messages.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.messages.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN messages.read_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.messages.read_at IS '(DC2Type:datetime_immutable)';


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- Name: moderation_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.moderation_actions (
    id integer NOT NULL,
    moderator_id integer NOT NULL,
    related_report_id integer,
    action_type character varying(50) NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id integer NOT NULL,
    reason text,
    notes text,
    metadata json,
    created_at timestamp(0) without time zone NOT NULL,
    expires_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.moderation_actions OWNER TO postgres;

--
-- Name: COLUMN moderation_actions.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.moderation_actions.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: moderation_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.moderation_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.moderation_actions_id_seq OWNER TO postgres;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    priority character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    expires_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone NOT NULL,
    read_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_id_seq OWNER TO postgres;

--
-- Name: notification_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preference (
    id integer NOT NULL,
    user_id integer NOT NULL,
    favorites_removed boolean NOT NULL,
    listing_expired boolean NOT NULL,
    subscription_expiring boolean NOT NULL,
    review_received boolean NOT NULL,
    review_negative_only boolean NOT NULL,
    email_enabled boolean NOT NULL,
    push_enabled boolean NOT NULL,
    email_frequency character varying(20) NOT NULL,
    do_not_disturb_start time(0) without time zone DEFAULT NULL::time without time zone,
    do_not_disturb_end time(0) without time zone DEFAULT NULL::time without time zone,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.notification_preference OWNER TO postgres;

--
-- Name: notification_preference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_preference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_preference_id_seq OWNER TO postgres;

--
-- Name: offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    buyer_id integer NOT NULL,
    seller_id integer NOT NULL,
    amount numeric(15,2) NOT NULL,
    counter_offer_amount numeric(15,2) DEFAULT NULL::numeric,
    message text,
    buyer_phone character varying(20) DEFAULT NULL::character varying,
    seller_response text,
    status character varying(20) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    expires_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    responded_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.offers OWNER TO postgres;

--
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.offers_id_seq OWNER TO postgres;

--
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id integer NOT NULL,
    user_id integer,
    provider_id integer,
    order_id integer,
    payment_method character varying(50) DEFAULT NULL::character varying,
    sens character varying(10) NOT NULL,
    amount numeric(12,2) NOT NULL,
    balance_before numeric(12,2) NOT NULL,
    balance_after numeric(12,2) NOT NULL,
    description text,
    created_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT check_sens CHECK (((sens)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying])::text[])))
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- Name: COLUMN operations.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.operations.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operations_id_seq OWNER TO postgres;

--
-- Name: operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operations_id_seq OWNED BY public.operations.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    client_id integer NOT NULL,
    provider_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50) DEFAULT NULL::character varying,
    wave_session_id character varying(255) DEFAULT NULL::character varying,
    om_transaction_id character varying(255) DEFAULT NULL::character varying,
    om_payment_token character varying(255) DEFAULT NULL::character varying,
    api_status character varying(100) DEFAULT NULL::character varying,
    api_code character varying(50) DEFAULT NULL::character varying,
    api_transaction_id character varying(255) DEFAULT NULL::character varying,
    api_transaction_date timestamp without time zone,
    status boolean NOT NULL,
    description text,
    metadata json,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: COLUMN orders.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payment_reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_reminders (
    id integer NOT NULL,
    payment_id integer NOT NULL,
    user_id integer NOT NULL,
    reminder_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    email_sent boolean DEFAULT false NOT NULL,
    sms_sent boolean DEFAULT false NOT NULL,
    push_sent boolean DEFAULT false NOT NULL,
    scheduled_at timestamp(0) without time zone NOT NULL,
    sent_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.payment_reminders OWNER TO postgres;

--
-- Name: payment_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_reminders_id_seq OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(255) DEFAULT NULL::character varying,
    status character varying(20) NOT NULL,
    description text NOT NULL,
    error_message text,
    metadata json,
    created_at timestamp(0) without time zone NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: COLUMN payments.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text,
    auth text,
    platform character varying(50) NOT NULL,
    device_token character varying(255),
    metadata json,
    created_at timestamp(0) without time zone NOT NULL,
    last_used_at timestamp(0) without time zone,
    is_active boolean NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: COLUMN push_subscriptions.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.push_subscriptions.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.push_subscriptions_id_seq OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipts (
    id integer NOT NULL,
    payment_id integer NOT NULL,
    booking_id integer NOT NULL,
    receipt_number character varying(50) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    rent_amount numeric(12,2) NOT NULL,
    charges_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    pdf_url text,
    issued_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.receipts OWNER TO postgres;

--
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receipts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.receipts_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    ip_address character varying(45) DEFAULT NULL::character varying,
    user_agent character varying(500) DEFAULT NULL::character varying
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: COLUMN refresh_tokens.expires_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.refresh_tokens.expires_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN refresh_tokens.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.refresh_tokens.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    reporter_id integer,
    listing_id integer NOT NULL,
    reason character varying(50) NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    admin_notes text,
    created_at timestamp(0) without time zone NOT NULL,
    reviewed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: COLUMN reports.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reports.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN reports.reviewed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reports.reviewed_at IS '(DC2Type:datetime_immutable)';


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO postgres;

--
-- Name: review_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_stats (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_reviews integer NOT NULL,
    average_rating numeric(3,2) NOT NULL,
    rating1_count integer NOT NULL,
    rating2_count integer NOT NULL,
    rating3_count integer NOT NULL,
    rating4_count integer NOT NULL,
    rating5_count integer NOT NULL,
    response_rate numeric(5,2) NOT NULL,
    avg_response_time_hours integer NOT NULL,
    last_updated timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.review_stats OWNER TO postgres;

--
-- Name: review_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_stats_id_seq OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    seller_id integer NOT NULL,
    rating smallint NOT NULL,
    comment text,
    review_type character varying(50) NOT NULL,
    is_verified boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: COLUMN reviews.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reviews.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    number character varying(20) NOT NULL,
    type character varying(20) NOT NULL,
    name character varying(255) DEFAULT NULL::character varying,
    description text,
    price_per_night numeric(12,2) NOT NULL,
    capacity smallint NOT NULL,
    beds smallint,
    amenities json,
    images json,
    status character varying(20) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rooms_id_seq OWNER TO postgres;

--
-- Name: security_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    ip_address character varying(45) NOT NULL,
    user_agent text,
    context json,
    severity character varying(20) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.security_logs OWNER TO postgres;

--
-- Name: COLUMN security_logs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.security_logs.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: security_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.security_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.security_logs_id_seq OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    account_type character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    start_date timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    auto_renew boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: COLUMN subscriptions.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.subscriptions.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: ticket_purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_purchases (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    ticket_type_id integer NOT NULL,
    payment_id integer,
    quantity integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    service_fee numeric(10,2) NOT NULL,
    qr_code character varying(64) NOT NULL,
    attendee_name character varying(255) NOT NULL,
    attendee_email character varying(255) NOT NULL,
    attendee_phone character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    purchased_at timestamp(0) without time zone NOT NULL,
    used_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.ticket_purchases OWNER TO postgres;

--
-- Name: COLUMN ticket_purchases.purchased_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ticket_purchases.purchased_at IS '(DC2Type:datetime_immutable)';


--
-- Name: ticket_purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_purchases_id_seq OWNER TO postgres;

--
-- Name: ticket_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_types (
    id integer NOT NULL,
    event_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    sold integer NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE public.ticket_types OWNER TO postgres;

--
-- Name: COLUMN ticket_types.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ticket_types.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: ticket_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_types_id_seq OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(180) NOT NULL,
    phone character varying(30),
    roles json NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    account_type character varying(20) NOT NULL,
    country character varying(100),
    city character varying(100),
    profile_picture text,
    is_email_verified boolean NOT NULL,
    is_phone_verified boolean NOT NULL,
    subscription_expires_at timestamp without time zone,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_lifetime_pro boolean NOT NULL,
    whatsapp_phone character varying(30) DEFAULT NULL::character varying,
    bio text,
    nationality character varying(100),
    subscription_start_date timestamp without time zone,
    is_banned boolean NOT NULL,
    is_suspended boolean NOT NULL,
    warnings_count integer,
    banned_until timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    suspended_until timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    is_verified boolean NOT NULL,
    verification_badges json,
    verification_category character varying(30) DEFAULT NULL::character varying,
    verified_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    verification_status character varying(20) DEFAULT NULL::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: verification_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_request (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    documents json NOT NULL,
    rejection_reason text,
    attempt_number integer NOT NULL,
    badge_type character varying(50) DEFAULT NULL::character varying,
    created_at timestamp(0) without time zone NOT NULL,
    reviewed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    reviewed_by integer,
    audit_log text
);


ALTER TABLE public.verification_request OWNER TO postgres;

--
-- Name: verification_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verification_request_id_seq OWNER TO postgres;

--
-- Name: visit_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_slots (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    owner_id integer NOT NULL,
    booked_by_id integer,
    date date NOT NULL,
    start_time time(0) without time zone NOT NULL,
    end_time time(0) without time zone NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    booked_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    notes text,
    visitor_message text,
    visitor_phone character varying(20) DEFAULT NULL::character varying,
    is_recurring boolean DEFAULT false NOT NULL,
    recurring_pattern character varying(20) DEFAULT NULL::character varying,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.visit_slots OWNER TO postgres;

--
-- Name: visit_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visit_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.visit_slots_id_seq OWNER TO postgres;

--
-- Name: webhook_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook_logs (
    id integer NOT NULL,
    provider character varying(50) NOT NULL,
    payload text NOT NULL,
    signature text,
    transaction_id character varying(255),
    event_type character varying(100),
    status character varying(20) NOT NULL,
    error_message text,
    ip_address character varying(45),
    created_at timestamp(0) without time zone NOT NULL,
    processed_at timestamp(0) without time zone
);


ALTER TABLE public.webhook_logs OWNER TO postgres;

--
-- Name: COLUMN webhook_logs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.webhook_logs.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: webhook_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.webhook_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.webhook_logs_id_seq OWNER TO postgres;

--
-- Name: webhook_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.webhook_logs_id_seq OWNED BY public.webhook_logs.id;


--
-- Data for Name: availability_calendar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.availability_calendar (id, listing_id, date, is_available, is_blocked, price_override, block_reason) FROM stdin;
\.


--
-- Data for Name: booking_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_payments (id, booking_id, user_id, type, amount, currency, status, payment_method, transaction_id, external_reference, due_date, paid_at, created_at, metadata) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, listing_id, tenant_id, owner_id, room_id, start_date, end_date, check_in_date, check_out_date, total_amount, deposit_amount, monthly_rent, charges, status, deposit_paid, first_rent_paid, deposit_released, requested_at, accepted_at, confirmed_at, created_at, updated_at, tenant_message, owner_response, cancellation_reason) FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, responded_by_id, name, email, subject, message, status, created_at, responded_at, response) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (id, booking_id, template_type, contract_data, pdf_url, owner_signed_at, tenant_signed_at, owner_signature_url, tenant_signature_url, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, listing_id, buyer_id, seller_id, created_at, last_message_at) FROM stdin;
\.


--
-- Data for Name: doctrine_migration_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctrine_migration_versions (version, executed_at, execution_time) FROM stdin;
DoctrineMigrations\\Version20241029000000	2026-02-16 11:43:40	181
DoctrineMigrations\\Version20241103000001	2026-02-16 11:43:40	6
DoctrineMigrations\\Version20241116000000	2026-02-16 11:43:40	75
DoctrineMigrations\\Version20241117000000	2026-02-16 11:43:40	5
DoctrineMigrations\\Version20241118_AddPriceUnitToListings	2026-02-16 11:43:40	3
DoctrineMigrations\\Version20241201_AddVirtualTourToListings	2026-02-16 11:43:40	12
DoctrineMigrations\\Version20241201_CreatePushSubscriptions	2026-02-16 11:43:40	25
DoctrineMigrations\\Version20241201_CreateWebhookLogs	2026-02-16 11:43:40	33
DoctrineMigrations\\Version20241202_CreateBookingSystem	\N	\N
DoctrineMigrations\\Version20251109220328	\N	\N
DoctrineMigrations\\Version20251117122000	\N	\N
DoctrineMigrations\\Version20251118_ListingViews	\N	\N
DoctrineMigrations\\Version20251128111713	\N	\N
DoctrineMigrations\\Version20251129_AddNuitPriceUnit	\N	\N
DoctrineMigrations\\Version20260128_AddContactMessages	\N	\N
\.


--
-- Data for Name: escrow_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.escrow_accounts (id, booking_id, deposit_amount, first_rent_amount, total_held, status, deposit_held_at, deposit_release_date, deposit_released_at, first_rent_released_at, release_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_images (id, event_id, url, order_position, created_at) FROM stdin;
\.


--
-- Data for Name: event_videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_videos (id, event_id, url, thumbnail, duration, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, user_id, title, description, category, event_date, event_end_date, country, city, address, specifications, status, views_count, total_tickets_sold, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, listing_id, created_at) FROM stdin;
\.


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.images (id, listing_id, user_id, url, thumbnail_url, key, order_position, status, uploaded_at) FROM stdin;
\.


--
-- Data for Name: late_payment_penalties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.late_payment_penalties (id, payment_id, booking_id, days_late, penalty_rate, penalty_amount, status, calculated_at, paid_at) FROM stdin;
\.


--
-- Data for Name: listing_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing_views (id, listing_id, user_id, ip_address, fingerprint, user_agent, referrer, viewed_at) FROM stdin;
3	2	\N	192.168.65.0	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	http://127.0.0.1:56469/	2026-02-18 13:19:58
4	2	\N	172.18.0.0	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	http://localhost:5173/	2026-02-18 20:25:48
5	3	\N	172.18.0.0	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	http://localhost:5173/	2026-02-18 20:30:47
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, user_id, title, description, price, currency, category, subcategory, type, country, city, address, status, specifications, views_count, contacts_count, is_featured, created_at, updated_at, expires_at, price_unit, virtual_tour_type, virtual_tour_url, virtual_tour_thumbnail, virtual_tour_data, commune, quartier, contact_phone, contact_whatsapp, contact_email) FROM stdin;
2	8	Appartement 3 pièces Cocody	Bel appartement meublé avec vue sur la lagune, 3 chambres, 2 salles de bain, cuisine équipée.	350000.00	XOF	immobilier	appartement	location	CI	Abidjan	\N	active	[]	2	0	f	2026-02-18 12:42:27	2026-02-18 12:42:27	2026-03-20 12:42:27	le mois	\N	\N	\N	\N	Cocody	\N	\N	\N	\N
3	5	Villa 4 pièces avec piscine Cocody Riviera	Magnifique villa moderne de 4 pièces avec piscine, jardin arboré et gardien 24h/24. Salon spacieux, cuisine équipée, 3 chambres dont une suite parentale avec dressing. Quartier résidentiel calme, proche des commerces et écoles.	750000.00	XOF	immobilier	Maison à louer	location	CI	Abidjan	\N	active	{"surface":"250","rooms":"4","bedrooms":"3","bathrooms":"2","floor":"RDC","furnished":false,"parking":true,"characteristics":{"Piscine":true,"Jardin":true,"Garage":true,"Climatisation":true,"Gardien":true,"Groupe \\u00e9lectrog\\u00e8ne":true,"Eau courante":true,"Quartier r\\u00e9sidentiel":true,"Proche \\u00e9cole":true,"Proche commerces":true}}	1	0	f	2026-02-18 20:30:08	2026-02-18 20:30:08	2026-03-20 20:30:08	le mois	\N	\N	\N	\N	Cocody	Riviera Faya	\N	\N	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, created_at, read_at) FROM stdin;
\.


--
-- Data for Name: moderation_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.moderation_actions (id, moderator_id, related_report_id, action_type, target_type, target_id, reason, notes, metadata, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, user_id, type, title, message, data, priority, status, expires_at, created_at, read_at) FROM stdin;
1	5	listing_published	🚀 Annonce publiée !	Votre annonce "Appartement 3 pièces Cocody" est maintenant en ligne. Elle sera visible pendant 29 jours.	{"listingId":1,"listingTitle":"Appartement 3 pi\\u00e8ces Cocody","expiresAt":"2026-03-20T10:38:03+00:00","expiresIn":29}	low	unread	2026-02-25 10:38:04	2026-02-18 10:38:04	\N
2	8	listing_published	🚀 Annonce publiée !	Votre annonce "Appartement 3 pièces Cocody" est maintenant en ligne. Elle sera visible pendant 29 jours.	{"listingId":2,"listingTitle":"Appartement 3 pi\\u00e8ces Cocody","expiresAt":"2026-03-20T12:42:27+00:00","expiresIn":29}	low	unread	2026-02-25 12:42:28	2026-02-18 12:42:28	\N
3	8	review_received	⭐ Nouvel avis : ⭐⭐⭐⭐⭐	Marie vous a laissé un avis sur "Appartement 3 pièces Cocody" : "Super appartement, très bien situé, propriétaire sympa!"	{"reviewerId":9,"reviewerName":"Marie","rating":5,"comment":"Super appartement, tr\\u00e8s bien situ\\u00e9, propri\\u00e9taire sympa!","listingId":2,"listingTitle":"Appartement 3 pi\\u00e8ces Cocody"}	medium	unread	2026-04-19 12:42:50	2026-02-18 12:42:50	\N
4	8	review_received	⭐ Nouvel avis : ⭐⭐⭐⭐	Awa vous a laissé un avis sur "Appartement 3 pièces Cocody" : "Bon appartement, quartier agréable mais un peu bruyant le soir."	{"reviewerId":10,"reviewerName":"Awa","rating":4,"comment":"Bon appartement, quartier agr\\u00e9able mais un peu bruyant le soir.","listingId":2,"listingTitle":"Appartement 3 pi\\u00e8ces Cocody"}	medium	unread	2026-04-19 12:45:01	2026-02-18 12:45:01	\N
5	5	verification_approved	⚡ Compte certifié !	Félicitations ! Votre compte a été certifié par un administrateur. Vous pouvez maintenant publier vos annonces. 🎉	{"badgeType":"manual_certified"}	high	unread	\N	2026-02-18 20:16:21	\N
6	5	listing_published	🚀 Annonce publiée !	Votre annonce "Villa 4 pièces avec piscine Cocody Riviera" est maintenant en ligne. Elle sera visible pendant 29 jours.	{"listingId":3,"listingTitle":"Villa 4 pi\\u00e8ces avec piscine Cocody Riviera","expiresAt":"2026-03-20T20:30:08+00:00","expiresIn":29}	low	unread	2026-02-25 20:30:08	2026-02-18 20:30:08	\N
\.


--
-- Data for Name: notification_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preference (id, user_id, favorites_removed, listing_expired, subscription_expiring, review_received, review_negative_only, email_enabled, push_enabled, email_frequency, do_not_disturb_start, do_not_disturb_end, created_at, updated_at) FROM stdin;
1	5	t	t	t	t	f	t	t	immediate	\N	\N	2026-02-18 10:38:04	2026-02-18 10:38:04
2	8	t	t	t	t	f	t	t	immediate	\N	\N	2026-02-18 12:42:28	2026-02-18 12:42:28
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offers (id, listing_id, buyer_id, seller_id, amount, counter_offer_amount, message, buyer_phone, seller_response, status, created_at, updated_at, expires_at, responded_at) FROM stdin;
\.


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, user_id, provider_id, order_id, payment_method, sens, amount, balance_before, balance_after, description, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, provider_id, amount, payment_method, wave_session_id, om_transaction_id, om_payment_token, api_status, api_code, api_transaction_id, api_transaction_date, status, description, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_reminders (id, payment_id, user_id, reminder_type, status, email_sent, sms_sent, push_sent, scheduled_at, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, amount, currency, payment_method, transaction_id, status, description, error_message, metadata, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, platform, device_token, metadata, created_at, last_used_at, is_active) FROM stdin;
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipts (id, payment_id, booking_id, receipt_number, period_start, period_end, rent_amount, charges_amount, total_amount, pdf_url, issued_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, listing_id, reason, description, status, admin_notes, created_at, reviewed_at) FROM stdin;
\.


--
-- Data for Name: review_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_stats (id, user_id, total_reviews, average_rating, rating1_count, rating2_count, rating3_count, rating4_count, rating5_count, response_rate, avg_response_time_hours, last_updated) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, listing_id, reviewer_id, seller_id, rating, comment, review_type, is_verified, created_at) FROM stdin;
1	2	9	8	5	Super appartement, très bien situé, propriétaire sympa!	transaction	f	2026-02-18 12:42:49
2	2	10	8	4	Bon appartement, quartier agréable mais un peu bruyant le soir.	transaction	f	2026-02-18 12:45:01
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, listing_id, number, type, name, description, price_per_night, capacity, beds, amenities, images, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: security_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.security_logs (id, user_id, action, ip_address, user_agent, context, severity, created_at) FROM stdin;
1	2	register	192.168.65.1	curl/8.7.1	{"email":"elohimmickaeldjedje@gmail.com","phone":"+330669177983","country":null}	info	2026-02-16 12:17:38
2	2	LOGIN_SUCCESS	192.168.65.1	curl/8.7.1	{"timestamp":"2026-02-16T12:18:41+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:18:41
3	2	LOGIN_SUCCESS	192.168.65.1	curl/8.7.1	{"timestamp":"2026-02-16T12:19:17+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:19:17
4	3	register	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"email":"mickaeldjedje7@gmail.com","phone":"+2250705516267","country":null}	info	2026-02-16 12:20:42
5	3	LOGIN_SUCCESS	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"timestamp":"2026-02-16T12:21:38+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:21:38
6	2	LOGIN_SUCCESS	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"timestamp":"2026-02-16T12:22:15+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:22:15
7	3	LOGIN_SUCCESS	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"timestamp":"2026-02-16T12:25:49+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:25:49
8	4	register	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"email":"djedjeauriane0@gmail.com","phone":"+2250141287470","country":null}	info	2026-02-16 12:30:10
9	4	LOGIN_SUCCESS	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"timestamp":"2026-02-16T12:30:11+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 12:30:11
10	2	LOGIN_SUCCESS	192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	{"timestamp":"2026-02-16T13:35:29+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-16 13:35:29
11	5	register	172.18.0.1	curl/8.7.1	{"email":"test@planb.com","phone":"+221771234567","country":null}	info	2026-02-18 10:28:31
12	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:28:34+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:28:34
13	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:35:03+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:35:03
14	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:37:05+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:37:05
15	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:37:21+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:37:21
16	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:37:38+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:37:38
17	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:38:03+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:38:03
18	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T10:38:19+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 10:38:19
19	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:39:17+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:39:17
20	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:40:29+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:40:29
21	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:40:55+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:40:55
22	5	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:41:55+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:41:55
23	6	register	172.18.0.1	curl/8.7.1	{"email":"nouveau@planb.com","phone":"+221770001122","country":null}	info	2026-02-18 11:45:45
24	7	register	172.18.0.1	curl/8.7.1	{"email":"court@planb.com","phone":"+221770000000","country":null}	info	2026-02-18 11:46:39
25	6	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:48:37+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:48:37
26	6	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T11:50:44+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 11:50:44
27	8	register	172.18.0.1	curl/8.7.1	{"email":"mdpok@planb.com","phone":null,"country":null}	info	2026-02-18 12:05:10
28	8	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T12:05:32+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 12:05:32
29	8	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T12:41:30+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 12:41:30
30	9	register	172.18.0.1	curl/8.7.1	{"email":"reviewer@planb.com","phone":null,"country":null}	info	2026-02-18 12:41:32
31	9	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T12:41:34+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 12:41:34
32	10	register	172.18.0.1	curl/8.7.1	{"email":"review3@planb.com","phone":null,"country":null}	info	2026-02-18 12:44:59
33	10	LOGIN_SUCCESS	172.18.0.1	curl/8.7.1	{"timestamp":"2026-02-18T12:45:00+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-18 12:45:00
34	11	register	172.18.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	{"email":"jean@gmail.com","phone":"+2250141287470","country":null}	info	2026-02-22 03:24:05
35	11	LOGIN_SUCCESS	172.18.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	{"timestamp":"2026-02-22T03:24:06+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-22 03:24:06
36	11	LOGIN_SUCCESS	172.18.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15	{"timestamp":"2026-02-22T03:32:49+00:00","path":"\\/api\\/v1\\/auth\\/login"}	info	2026-02-22 03:32:49
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, account_type, status, start_date, expires_at, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_purchases (id, user_id, event_id, ticket_type_id, payment_id, quantity, total_amount, service_fee, qr_code, attendee_name, attendee_email, attendee_phone, status, purchased_at, used_at) FROM stdin;
\.


--
-- Data for Name: ticket_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_types (id, event_id, name, description, price, quantity, sold, status, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, roles, password, first_name, last_name, account_type, country, city, profile_picture, is_email_verified, is_phone_verified, subscription_expires_at, created_at, updated_at, is_lifetime_pro, whatsapp_phone, bio, nationality, subscription_start_date, is_banned, is_suspended, warnings_count, banned_until, suspended_until, is_verified, verification_badges, verification_category, verified_at, verification_status) FROM stdin;
2	elohimmickaeldjedje@gmail.com	+330669177983	["ROLE_ADMIN", "ROLE_USER"]	$2y$12$JTLAoMNt8IHXIQYXLliXYOvCwdeStiTcRmTp2AlrRqM1A5aSfcqTi	Elohim	Mickael Djedje	PRO	CI	\N	\N	f	f	\N	2026-02-16 12:17:37	2026-02-16 12:17:37	t	+330669177983	\N	Ivoirienne	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
3	mickaeldjedje7@gmail.com	+2250705516267	["ROLE_USER"]	$2y$12$D52D6zBLAnZPAEYdP2oYa.X76KPoAQ7NWqPvpR8i9BoQN4rqVRJVe	jean	dupont	FREE	\N	\N	\N	f	f	\N	2026-02-16 12:20:42	2026-02-16 12:20:42	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
4	djedjeauriane0@gmail.com	+2250141287470	["ROLE_USER"]	$2y$12$xoesrmhmMx5oMQm4ve1EXuFvqfNap9LGV9KLMY.MeFoNqWXB4Fk.e	grace	djedje	FREE	\N	\N	\N	f	f	\N	2026-02-16 12:30:09	2026-02-16 12:30:09	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
6	nouveau@planb.com	+221770001122	["ROLE_USER"]	$2y$12$CxWz7dBA2/9n1dKrGNOOa.WH8pJWMtBxg.sat.BLUpfLT3pjpexjC	Moussa	Diallo	FREE	\N	\N	\N	f	f	\N	2026-02-18 11:45:42	2026-02-18 11:45:42	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
7	court@planb.com	+221770000000	["ROLE_USER"]	$2y$12$I2xMzWkd9qONFbaVyibjY.BESx96PVKilFV4FMOLh9nmwOXPJYJP2	Test	Test	FREE	\N	\N	\N	f	f	\N	2026-02-18 11:46:36	2026-02-18 11:46:36	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
8	mdpok@planb.com	\N	["ROLE_USER"]	$2y$12$4jafz9McDNdW1ek9Sojtnew9HgJAquo27/CGMED/LiHpLtvrRJwGK	Test	OK	FREE	\N	\N	\N	f	f	\N	2026-02-18 12:05:09	2026-02-18 12:05:09	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
9	reviewer@planb.com	\N	["ROLE_USER"]	$2y$12$ZlUI6Zt2K7tYTQakF8g1pOvjmJ4QMT4jiqXRnA2pLXgOz3BbWzbXK	Marie	Dupont	FREE	\N	\N	\N	f	f	\N	2026-02-18 12:41:30	2026-02-18 12:41:30	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
10	review3@planb.com	\N	["ROLE_USER"]	$2y$12$zxoS7NQi73pUu1M.lxMNkeJbSVawYcLmb1DLMN0nrCPwQ0mPA2yR6	Awa	Diallo	FREE	\N	\N	\N	f	f	\N	2026-02-18 12:44:58	2026-02-18 12:44:58	f	\N	\N	\N	\N	f	f	0	\N	\N	f	\N	\N	\N	\N
5	test@planb.com	+221771234567	["ROLE_USER"]	$2y$12$CDBL0A3sBHIn1H8v//wBdeg0dg8RN2NzyAekSb/xocYUF25BF1rUa	Jean	Test	FREE	SN	Dakar	\N	f	f	\N	2026-02-18 10:28:30	2026-02-18 11:42:08	f	\N	Testeur API	\N	\N	f	f	0	\N	\N	t	["manual_certified"]	manual	2026-02-18 20:16:21	approved
11	jean@gmail.com	+2250141287470	["ROLE_USER"]	$2y$12$va1BWW0bOvjZdMkPkNCkv.cuBqe.adRQXc./MyJdTxCbn6aIOWB9O	Michelle Priscille	dupon	FREE	\N	\N	\N	f	f	\N	2026-02-22 03:24:04	2026-02-22 03:24:04	f	\N	\N	\N	\N	f	f	0	\N	\N	f	[]	\N	\N	\N
\.


--
-- Data for Name: verification_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_request (id, user_id, category, status, documents, rejection_reason, attempt_number, badge_type, created_at, reviewed_at, reviewed_by, audit_log) FROM stdin;
1	5	manual	approved	[]	\N	1	manual_certified	2026-02-18 20:16:21	2026-02-18 20:16:21	2	Certifié manuellement le 18/02/2026 20:16 par admin #2 (Elohim Mickael Djedje)
\.


--
-- Data for Name: visit_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_slots (id, listing_id, owner_id, booked_by_id, date, start_time, end_time, status, booked_at, notes, visitor_message, visitor_phone, is_recurring, recurring_pattern, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webhook_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhook_logs (id, provider, payload, signature, transaction_id, event_type, status, error_message, ip_address, created_at, processed_at) FROM stdin;
\.


--
-- Name: availability_calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.availability_calendar_id_seq', 1, false);


--
-- Name: booking_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_payments_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contracts_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: escrow_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.escrow_accounts_id_seq', 1, false);


--
-- Name: event_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_images_id_seq', 1, false);


--
-- Name: event_videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_videos_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.images_id_seq', 1, false);


--
-- Name: late_payment_penalties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.late_payment_penalties_id_seq', 1, false);


--
-- Name: listing_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listing_views_id_seq', 5, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listings_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: moderation_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.moderation_actions_id_seq', 1, false);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 6, true);


--
-- Name: notification_preference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_preference_id_seq', 2, true);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offers_id_seq', 1, false);


--
-- Name: operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operations_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payment_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_reminders_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, false);


--
-- Name: receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receipts_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 1, false);


--
-- Name: review_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_stats_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 2, true);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_id_seq', 1, false);


--
-- Name: security_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.security_logs_id_seq', 36, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: ticket_purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_purchases_id_seq', 1, false);


--
-- Name: ticket_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_types_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: verification_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_request_id_seq', 1, true);


--
-- Name: visit_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visit_slots_id_seq', 1, false);


--
-- Name: webhook_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.webhook_logs_id_seq', 1, false);


--
-- Name: availability_calendar availability_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_calendar
    ADD CONSTRAINT availability_calendar_pkey PRIMARY KEY (id);


--
-- Name: booking_payments booking_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT booking_payments_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: doctrine_migration_versions doctrine_migration_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctrine_migration_versions
    ADD CONSTRAINT doctrine_migration_versions_pkey PRIMARY KEY (version);


--
-- Name: escrow_accounts escrow_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT escrow_accounts_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_pkey PRIMARY KEY (id);


--
-- Name: event_videos event_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_videos
    ADD CONSTRAINT event_videos_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: late_payment_penalties late_payment_penalties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_payment_penalties
    ADD CONSTRAINT late_payment_penalties_pkey PRIMARY KEY (id);


--
-- Name: listing_views listing_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: moderation_actions moderation_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT moderation_actions_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_preference notification_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preference
    ADD CONSTRAINT notification_preference_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: operations operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_reminders payment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: review_stats review_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_stats
    ADD CONSTRAINT review_stats_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: security_logs security_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: ticket_purchases ticket_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_purchases
    ADD CONSTRAINT ticket_purchases_pkey PRIMARY KEY (id);


--
-- Name: ticket_types ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_request verification_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_request
    ADD CONSTRAINT verification_request_pkey PRIMARY KEY (id);


--
-- Name: visit_slots visit_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_slots
    ADD CONSTRAINT visit_slots_pkey PRIMARY KEY (id);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: idx_1b33136071f7e88b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_1b33136071f7e88b ON public.event_videos USING btree (event_id);


--
-- Name: idx_281453488d9f6d38; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_281453488d9f6d38 ON public.operations USING btree (order_id);


--
-- Name: idx_28145348a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_28145348a76ed395 ON public.operations USING btree (user_id);


--
-- Name: idx_2e0b3a70e313f8db; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_2e0b3a70e313f8db ON public.moderation_actions USING btree (related_report_id);


--
-- Name: idx_305eebb44c3a3bb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_305eebb44c3a3bb ON public.ticket_purchases USING btree (payment_id);


--
-- Name: idx_305eebb471f7e88b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_305eebb471f7e88b ON public.ticket_purchases USING btree (event_id);


--
-- Name: idx_305eebb4a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_305eebb4a76ed395 ON public.ticket_purchases USING btree (user_id);


--
-- Name: idx_305eebb4c980d5c1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_305eebb4c980d5c1 ON public.ticket_purchases USING btree (ticket_type_id);


--
-- Name: idx_41278201296135a7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_41278201296135a7 ON public.contact_messages USING btree (responded_by_id);


--
-- Name: idx_5387574aa76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_5387574aa76ed395 ON public.events USING btree (user_id);


--
-- Name: idx_65d29b32a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_65d29b32a76ed395 ON public.payments USING btree (user_id);


--
-- Name: idx_7100eabb71f7e88b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_7100eabb71f7e88b ON public.ticket_types USING btree (event_id);


--
-- Name: idx_7a853c3554177093; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_7a853c3554177093 ON public.bookings USING btree (room_id);


--
-- Name: idx_9a7bd98ea76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_9a7bd98ea76ed395 ON public.listings USING btree (user_id);


--
-- Name: idx_9bace7e1a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_9bace7e1a76ed395 ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_bdc1ceb17e3c61f9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bdc1ceb17e3c61f9 ON public.visit_slots USING btree (owner_id);


--
-- Name: idx_bdc1ceb1f4a5bd90; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bdc1ceb1f4a5bd90 ON public.visit_slots USING btree (booked_by_id);


--
-- Name: idx_bf5476caa76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bf5476caa76ed395 ON public.notification USING btree (user_id);


--
-- Name: idx_booking_payments_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_payments_booking ON public.booking_payments USING btree (booking_id);


--
-- Name: idx_booking_payments_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_payments_due_date ON public.booking_payments USING btree (due_date);


--
-- Name: idx_booking_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_payments_status ON public.booking_payments USING btree (status);


--
-- Name: idx_booking_payments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_payments_user ON public.booking_payments USING btree (user_id);


--
-- Name: idx_bookings_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_dates ON public.bookings USING btree (start_date, end_date);


--
-- Name: idx_bookings_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_listing ON public.bookings USING btree (listing_id);


--
-- Name: idx_bookings_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_owner ON public.bookings USING btree (owner_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_tenant ON public.bookings USING btree (tenant_id);


--
-- Name: idx_c2521bf1d4619d1a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_c2521bf1d4619d1a ON public.conversations USING btree (listing_id);


--
-- Name: idx_calendar_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_available ON public.availability_calendar USING btree (listing_id, date, is_available);


--
-- Name: idx_calendar_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_date ON public.availability_calendar USING btree (date);


--
-- Name: idx_calendar_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_listing ON public.availability_calendar USING btree (listing_id);


--
-- Name: idx_contact_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_created ON public.contact_messages USING btree (created_at);


--
-- Name: idx_contact_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_status ON public.contact_messages USING btree (status);


--
-- Name: idx_contracts_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contracts_booking ON public.contracts USING btree (booking_id);


--
-- Name: idx_conversation_buyer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_buyer ON public.conversations USING btree (buyer_id);


--
-- Name: idx_conversation_last_message; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_last_message ON public.conversations USING btree (last_message_at);


--
-- Name: idx_conversation_seller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_seller ON public.conversations USING btree (seller_id);


--
-- Name: idx_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_created ON public.notification USING btree (created_at);


--
-- Name: idx_d286c93871f7e88b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_d286c93871f7e88b ON public.event_images USING btree (event_id);


--
-- Name: idx_da4604278de820d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_da4604278de820d9 ON public.offers USING btree (seller_id);


--
-- Name: idx_e01fbe6aa76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e01fbe6aa76ed395 ON public.images USING btree (user_id);


--
-- Name: idx_e01fbe6ad4619d1a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e01fbe6ad4619d1a ON public.images USING btree (listing_id);


--
-- Name: idx_e52ffdee19eb6921; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e52ffdee19eb6921 ON public.orders USING btree (client_id);


--
-- Name: idx_e52ffdeea53a8aa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e52ffdeea53a8aa ON public.orders USING btree (provider_id);


--
-- Name: idx_e71e440bd4619d1a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e71e440bd4619d1a ON public.listing_views USING btree (listing_id);


--
-- Name: idx_escrow_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_escrow_booking ON public.escrow_accounts USING btree (booking_id);


--
-- Name: idx_escrow_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_escrow_status ON public.escrow_accounts USING btree (status);


--
-- Name: idx_event_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_category ON public.events USING btree (category);


--
-- Name: idx_event_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_date ON public.events USING btree (event_date);


--
-- Name: idx_event_image_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_image_order ON public.event_images USING btree (order_position);


--
-- Name: idx_event_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_location ON public.events USING btree (country, city);


--
-- Name: idx_event_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_status ON public.events USING btree (status);


--
-- Name: idx_f11fa745e1cfe6f5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_f11fa745e1cfe6f5 ON public.reports USING btree (reporter_id);


--
-- Name: idx_favorite_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorite_listing ON public.favorites USING btree (listing_id);


--
-- Name: idx_favorite_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorite_user ON public.favorites USING btree (user_id);


--
-- Name: idx_fingerprint; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fingerprint ON public.listing_views USING btree (listing_id, fingerprint);


--
-- Name: idx_listing_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_category ON public.listings USING btree (category);


--
-- Name: idx_listing_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_created ON public.listings USING btree (created_at);


--
-- Name: idx_listing_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_location ON public.listings USING btree (country, city);


--
-- Name: idx_listing_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_status ON public.listings USING btree (status);


--
-- Name: idx_listing_viewed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_viewed_at ON public.listing_views USING btree (listing_id, viewed_at);


--
-- Name: idx_message_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_message_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_created ON public.messages USING btree (created_at);


--
-- Name: idx_message_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_read ON public.messages USING btree (is_read);


--
-- Name: idx_message_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_moderation_action_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_moderation_action_type ON public.moderation_actions USING btree (action_type);


--
-- Name: idx_moderation_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_moderation_created ON public.moderation_actions USING btree (created_at);


--
-- Name: idx_moderation_moderator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_moderation_moderator ON public.moderation_actions USING btree (moderator_id);


--
-- Name: idx_moderation_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_moderation_target ON public.moderation_actions USING btree (target_type, target_id);


--
-- Name: idx_offer_buyer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offer_buyer ON public.offers USING btree (buyer_id);


--
-- Name: idx_offer_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offer_listing ON public.offers USING btree (listing_id);


--
-- Name: idx_offer_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offer_status ON public.offers USING btree (status);


--
-- Name: idx_om_transaction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_om_transaction ON public.orders USING btree (om_transaction_id);


--
-- Name: idx_operation_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_operation_date ON public.operations USING btree (created_at);


--
-- Name: idx_operation_sens; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_operation_sens ON public.operations USING btree (sens);


--
-- Name: idx_order_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status ON public.orders USING btree (status);


--
-- Name: idx_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_status ON public.payments USING btree (status);


--
-- Name: idx_payment_transaction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transaction ON public.payments USING btree (transaction_id);


--
-- Name: idx_penalties_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_penalties_booking ON public.late_payment_penalties USING btree (booking_id);


--
-- Name: idx_penalties_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_penalties_payment ON public.late_payment_penalties USING btree (payment_id);


--
-- Name: idx_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_priority ON public.notification USING btree (priority);


--
-- Name: idx_push_endpoint; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_push_endpoint ON public.push_subscriptions USING btree (endpoint);


--
-- Name: idx_push_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_push_user ON public.push_subscriptions USING btree (user_id);


--
-- Name: idx_receipts_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_booking ON public.receipts USING btree (booking_id);


--
-- Name: idx_receipts_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_number ON public.receipts USING btree (receipt_number);


--
-- Name: idx_receipts_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_payment ON public.receipts USING btree (payment_id);


--
-- Name: idx_refresh_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_token ON public.refresh_tokens USING btree (token);


--
-- Name: idx_reminders_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reminders_payment ON public.payment_reminders USING btree (payment_id);


--
-- Name: idx_reminders_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reminders_scheduled ON public.payment_reminders USING btree (scheduled_at, status);


--
-- Name: idx_reminders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reminders_user ON public.payment_reminders USING btree (user_id);


--
-- Name: idx_report_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_created ON public.reports USING btree (created_at);


--
-- Name: idx_report_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_listing ON public.reports USING btree (listing_id);


--
-- Name: idx_report_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_status ON public.reports USING btree (status);


--
-- Name: idx_review_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_created ON public.reviews USING btree (created_at);


--
-- Name: idx_review_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_listing ON public.reviews USING btree (listing_id);


--
-- Name: idx_review_reviewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_reviewer ON public.reviews USING btree (reviewer_id);


--
-- Name: idx_review_seller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_seller ON public.reviews USING btree (seller_id);


--
-- Name: idx_room_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_listing ON public.rooms USING btree (listing_id);


--
-- Name: idx_room_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_status ON public.rooms USING btree (status);


--
-- Name: idx_room_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_type ON public.rooms USING btree (type);


--
-- Name: idx_security_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_action ON public.security_logs USING btree (action);


--
-- Name: idx_security_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_created ON public.security_logs USING btree (created_at);


--
-- Name: idx_security_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_ip ON public.security_logs USING btree (ip_address);


--
-- Name: idx_security_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_security_user ON public.security_logs USING btree (user_id);


--
-- Name: idx_ticket_purchase_qr; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_ticket_purchase_qr ON public.ticket_purchases USING btree (qr_code);


--
-- Name: idx_ticket_purchase_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_purchase_status ON public.ticket_purchases USING btree (status);


--
-- Name: idx_ticket_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_type_status ON public.ticket_types USING btree (status);


--
-- Name: idx_user_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_ip ON public.listing_views USING btree (user_id, ip_address);


--
-- Name: idx_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_status ON public.notification USING btree (user_id, status);


--
-- Name: idx_verification_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verification_status ON public.verification_request USING btree (status);


--
-- Name: idx_verification_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verification_user ON public.verification_request USING btree (user_id);


--
-- Name: idx_visit_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_available ON public.visit_slots USING btree (listing_id, date, status);


--
-- Name: idx_visit_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_date ON public.visit_slots USING btree (date);


--
-- Name: idx_visit_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_listing ON public.visit_slots USING btree (listing_id);


--
-- Name: idx_visit_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_status ON public.visit_slots USING btree (status);


--
-- Name: idx_wave_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wave_session ON public.orders USING btree (wave_session_id);


--
-- Name: idx_webhook_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_created ON public.webhook_logs USING btree (created_at);


--
-- Name: idx_webhook_provider_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_provider_status ON public.webhook_logs USING btree (provider, status);


--
-- Name: idx_webhook_transaction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhook_transaction ON public.webhook_logs USING btree (transaction_id);


--
-- Name: listing_buyer_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX listing_buyer_unique ON public.conversations USING btree (listing_id, buyer_id);


--
-- Name: uniq_1debe3a2b0adb74c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_1debe3a2b0adb74c ON public.receipts USING btree (receipt_number);


--
-- Name: uniq_44c94bb1a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_44c94bb1a76ed395 ON public.review_stats USING btree (user_id);


--
-- Name: uniq_4778a01a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_4778a01a76ed395 ON public.subscriptions USING btree (user_id);


--
-- Name: uniq_950a9733301c60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_950a9733301c60 ON public.contracts USING btree (booking_id);


--
-- Name: uniq_9bace7e15f37a13b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_9bace7e15f37a13b ON public.refresh_tokens USING btree (token);


--
-- Name: uniq_9e94f4973301c60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_9e94f4973301c60 ON public.escrow_accounts USING btree (booking_id);


--
-- Name: uniq_a61b1571a76ed395; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_a61b1571a76ed395 ON public.notification_preference USING btree (user_id);


--
-- Name: uniq_identifier_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_identifier_email ON public.users USING btree (email);


--
-- Name: unique_listing_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_listing_date ON public.availability_calendar USING btree (listing_id, date);


--
-- Name: unique_view; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_view ON public.listing_views USING btree (listing_id, user_id, fingerprint);


--
-- Name: user_listing_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_listing_unique ON public.favorites USING btree (user_id, listing_id);


--
-- Name: event_videos fk_1b33136071f7e88b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_videos
    ADD CONSTRAINT fk_1b33136071f7e88b FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: receipts fk_1debe3a23301c60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT fk_1debe3a23301c60 FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: receipts fk_1debe3a24c3a3bb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT fk_1debe3a24c3a3bb FOREIGN KEY (payment_id) REFERENCES public.booking_payments(id) ON DELETE CASCADE;


--
-- Name: verification_request fk_20fddf4ea76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_request
    ADD CONSTRAINT fk_20fddf4ea76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: operations fk_281453488d9f6d38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT fk_281453488d9f6d38 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: operations fk_28145348a53a8aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT fk_28145348a53a8aa FOREIGN KEY (provider_id) REFERENCES public.users(id);


--
-- Name: operations fk_28145348a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT fk_28145348a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: moderation_actions fk_2e0b3a70d0afa354; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT fk_2e0b3a70d0afa354 FOREIGN KEY (moderator_id) REFERENCES public.users(id);


--
-- Name: moderation_actions fk_2e0b3a70e313f8db; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT fk_2e0b3a70e313f8db FOREIGN KEY (related_report_id) REFERENCES public.reports(id) ON DELETE SET NULL;


--
-- Name: payment_reminders fk_2ebb96fc4c3a3bb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT fk_2ebb96fc4c3a3bb FOREIGN KEY (payment_id) REFERENCES public.booking_payments(id) ON DELETE CASCADE;


--
-- Name: payment_reminders fk_2ebb96fca76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT fk_2ebb96fca76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: availability_calendar fk_2f22cfcdd4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_calendar
    ADD CONSTRAINT fk_2f22cfcdd4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: security_logs fk_2f9e4a9da76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT fk_2f9e4a9da76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ticket_purchases fk_305eebb44c3a3bb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_purchases
    ADD CONSTRAINT fk_305eebb44c3a3bb FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: ticket_purchases fk_305eebb471f7e88b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_purchases
    ADD CONSTRAINT fk_305eebb471f7e88b FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: ticket_purchases fk_305eebb4a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_purchases
    ADD CONSTRAINT fk_305eebb4a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ticket_purchases fk_305eebb4c980d5c1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_purchases
    ADD CONSTRAINT fk_305eebb4c980d5c1 FOREIGN KEY (ticket_type_id) REFERENCES public.ticket_types(id);


--
-- Name: contact_messages fk_41278201296135a7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT fk_41278201296135a7 FOREIGN KEY (responded_by_id) REFERENCES public.users(id);


--
-- Name: review_stats fk_44c94bb1a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_stats
    ADD CONSTRAINT fk_44c94bb1a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions fk_4778a01a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_4778a01a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: events fk_5387574aa76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_5387574aa76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: booking_payments fk_5ee605bf3301c60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT fk_5ee605bf3301c60 FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_payments fk_5ee605bfa76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT fk_5ee605bfa76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments fk_65d29b32a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_65d29b32a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reviews fk_6970eb0f70574616; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_6970eb0f70574616 FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: reviews fk_6970eb0f8de820d9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_6970eb0f8de820d9 FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: reviews fk_6970eb0fd4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_6970eb0fd4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: ticket_types fk_7100eabb71f7e88b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT fk_7100eabb71f7e88b FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: late_payment_penalties fk_77c8df9e3301c60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_payment_penalties
    ADD CONSTRAINT fk_77c8df9e3301c60 FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: late_payment_penalties fk_77c8df9e4c3a3bb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_payment_penalties
    ADD CONSTRAINT fk_77c8df9e4c3a3bb FOREIGN KEY (payment_id) REFERENCES public.booking_payments(id) ON DELETE CASCADE;


--
-- Name: bookings fk_7a853c3554177093; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_7a853c3554177093 FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


--
-- Name: bookings fk_7a853c357e3c61f9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_7a853c357e3c61f9 FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings fk_7a853c359033212a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_7a853c359033212a FOREIGN KEY (tenant_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bookings fk_7a853c35d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_7a853c35d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rooms fk_7ca11a96d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT fk_7ca11a96d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: contracts fk_950a9733301c60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT fk_950a9733301c60 FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: listings fk_9a7bd98ea76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT fk_9a7bd98ea76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: refresh_tokens fk_9bace7e1a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_9bace7e1a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: escrow_accounts fk_9e94f4973301c60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT fk_9e94f4973301c60 FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: notification_preference fk_a61b1571a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preference
    ADD CONSTRAINT fk_a61b1571a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: visit_slots fk_bdc1ceb17e3c61f9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_slots
    ADD CONSTRAINT fk_bdc1ceb17e3c61f9 FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: visit_slots fk_bdc1ceb1d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_slots
    ADD CONSTRAINT fk_bdc1ceb1d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: visit_slots fk_bdc1ceb1f4a5bd90; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_slots
    ADD CONSTRAINT fk_bdc1ceb1f4a5bd90 FOREIGN KEY (booked_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification fk_bf5476caa76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_bf5476caa76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations fk_c2521bf16c755722; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT fk_c2521bf16c755722 FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations fk_c2521bf18de820d9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT fk_c2521bf18de820d9 FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations fk_c2521bf1d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT fk_c2521bf1d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: event_images fk_d286c93871f7e88b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT fk_d286c93871f7e88b FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: offers fk_da4604276c755722; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_da4604276c755722 FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: offers fk_da4604278de820d9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_da4604278de820d9 FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: offers fk_da460427d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_da460427d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: messages fk_db021e969ac0396; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_db021e969ac0396 FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages fk_db021e96f624b39d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_db021e96f624b39d FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: images fk_e01fbe6aa76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT fk_e01fbe6aa76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: images fk_e01fbe6ad4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT fk_e01fbe6ad4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: favorites fk_e46960f5a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_e46960f5a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorites fk_e46960f5d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_e46960f5d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: orders fk_e52ffdee19eb6921; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_e52ffdee19eb6921 FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: orders fk_e52ffdeea53a8aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_e52ffdeea53a8aa FOREIGN KEY (provider_id) REFERENCES public.users(id);


--
-- Name: listing_views fk_e71e440bd4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT fk_e71e440bd4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: reports fk_f11fa745d4619d1a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_f11fa745d4619d1a FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: reports fk_f11fa745e1cfe6f5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_f11fa745e1cfe6f5 FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gNo9WBkcd1HB8HdkRuT9qx6d5fic3A4PpoEgqyuSZHr6E7P70bVorneDnu2Pdrt

