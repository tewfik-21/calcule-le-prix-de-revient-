DELETE FROM favorites;
DELETE FROM bids;
DELETE FROM chat_messages;
DELETE FROM chat_rooms;
DELETE FROM tender_offers;
DELETE FROM tenders;
DELETE FROM item_reviews;
DELETE FROM listings;
DELETE FROM stores;
-- We'll keep users (profiles) so the admin can still log in, or we can just delete non-admin profiles.
DELETE FROM profiles WHERE role != 'admin';
