-- Demo data cleanup for the current visible marketplace rows.
-- Assumes the catalog is currently showing textbook-backed rows.
-- This updates the three most recent textbook records so the live demo has
-- presentable titles and stable local thumbnail paths.

begin;

with ranked_assets as (
  select
    id,
    row_number() over (order by created_at desc nulls last, id desc) as row_num
  from public.assets
  where asset_type = 'textbook'
)
update public.assets as assets
set
  image_url = updates.image_url,
  verification_status = updates.verification_status,
  metadata = jsonb_build_object(
    'title', updates.title,
    'author', updates.author,
    'isbn', updates.isbn,
    'course_code', updates.course_code,
    'edition', updates.edition,
    'condition', updates.condition
  )
from (
  values
    (
      1,
      'Introduction to Algorithms',
      'Thomas H. Cormen',
      '9780262046305',
      'CSU340',
      '4th',
      'used-good',
      '/images/textbook.jpg',
      'verified'
    ),
    (
      2,
      'TI-84 Calculator',
      'Texas Instruments',
      'N/A',
      'MATH226',
      'Standard',
      'used-good',
      '/images/calculator.jpeg',
      'verified'
    ),
    (
      3,
      'Lab Coat',
      'Campus Supply',
      'N/A',
      'BIO101',
      'Medium',
      'used-good',
      '/images/lab-coat.jpeg',
      'pending'
    )
) as updates(
  row_num,
  title,
  author,
  isbn,
  course_code,
  edition,
  condition,
  image_url,
  verification_status
)
where assets.id = (
  select ranked_assets.id
  from ranked_assets
  where ranked_assets.row_num = updates.row_num
);

commit;

-- Correct safety check (uses metadata JSON)
select
  id,
  metadata->>'title' as title,
  metadata->>'course_code' as course_code,
  image_url,
  verification_status
from public.assets
where asset_type = 'textbook'
order by created_at desc nulls last
limit 3;